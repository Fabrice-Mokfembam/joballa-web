/**
 * Remove smoke-test jobs from Postgres, keeping only jobs owned by:
 *   - fabricekongnyuy2@gmail.com
 *   - kongnyuy98765@gmail.com
 *
 * Usage: node scripts/cleanup-smoke-jobs.mjs
 *        node scripts/cleanup-smoke-jobs.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const KEEP_EMAILS = ["fabricekongnyuy2@gmail.com", "kongnyuy98765@gmail.com"];
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnvFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    /* no file */
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[cleanup-jobs] DATABASE_URL is required in .env");
  process.exit(1);
}

function q(id) {
  return `"${id.replace(/"/g, '""')}"`;
}

async function tableColumns(client, table) {
  const { rows } = await client.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    `,
    [table],
  );
  return rows.map((r) => r.column_name);
}

function pickColumn(columns, candidates) {
  for (const name of candidates) {
    if (columns.includes(name)) return name;
  }
  return null;
}

async function detectSchema(client) {
  const jobCols = await tableColumns(client, "jobs");
  const epCols = await tableColumns(client, "employer_profiles");

  const employerCol = pickColumn(jobCols, ["employerId", "employer_id", "owner_id"]);
  const epUserCol = pickColumn(epCols, ["userId", "user_id"]);
  const epIdCol = pickColumn(epCols, ["id"]);

  if (!employerCol || !epUserCol || !epIdCol) {
    throw new Error(`Could not map schema. jobs: ${jobCols.join(", ")}; employer_profiles: ${epCols.join(", ")}`);
  }

  return { employerCol, epUserCol, epIdCol };
}

async function resolveKeepEmployerIds(client, schema) {
  const exact = await client.query(
    `
    SELECT u.id AS user_id, u.email, ep.${q(schema.epIdCol)} AS employer_id
    FROM users u
    LEFT JOIN employer_profiles ep ON ep.${q(schema.epUserCol)} = u.id
    WHERE lower(u.email) = ANY($1::text[])
    `,
    [KEEP_EMAILS.map((e) => e.toLowerCase())],
  );

  const missing = KEEP_EMAILS.filter(
    (email) => !exact.rows.some((r) => String(r.email).toLowerCase() === email.toLowerCase()),
  );

  let fuzzyRows = [];
  if (missing.length) {
    const { rows } = await client.query(
      `
      SELECT u.id AS user_id, u.email, ep.${q(schema.epIdCol)} AS employer_id
      FROM users u
      LEFT JOIN employer_profiles ep ON ep.${q(schema.epUserCol)} = u.id
      WHERE u.email ILIKE ANY($1::text[])
      `,
      [missing.map((email) => {
        const local = email.split("@")[0] ?? email;
        return `%${local.replace(/[%_]/g, "")}%`;
      })],
    );
    fuzzyRows = rows;
  }

  const rows = [...exact.rows];
  for (const email of KEEP_EMAILS) {
    if (rows.some((r) => String(r.email).toLowerCase() === email.toLowerCase())) continue;
    const fuzzy = fuzzyRows.find((r) => String(r.email).toLowerCase().includes(email.split("@")[0] ?? ""));
    if (fuzzy) rows.push(fuzzy);
  }

  for (const email of KEEP_EMAILS) {
    const row = rows.find((r) => String(r.email).toLowerCase() === email.toLowerCase())
      ?? rows.find((r) => String(r.email).toLowerCase().includes(email.split("@")[0] ?? ""));
    if (!row) {
      console.warn(`[cleanup-jobs] WARNING: account not found: ${email}`);
    } else if (!row.employer_id) {
      console.warn(`[cleanup-jobs] WARNING: no employer profile for ${row.email}`);
    } else {
      console.log(`[cleanup-jobs] KEEP ${row.email} → employer ${row.employer_id}`);
    }
  }

  const keepIds = [...new Set(rows.map((r) => r.employer_id).filter(Boolean))];
  return keepIds;
}

async function deleteJobsAndDependents(client, schema, keepEmployerIds) {
  const jobCol = q(schema.employerCol);
  const targetJobs = await client.query(
    `SELECT id FROM jobs WHERE ${jobCol}::text <> ALL($1::text[])`,
    [keepEmployerIds],
  );
  const jobIds = targetJobs.rows.map((r) => r.id);
  if (!jobIds.length) return 0;

  const dependentDeletes = [
    `DELETE FROM payments WHERE "engagementId" IN (SELECT id FROM work_engagements WHERE "jobId" = ANY($1::text[]))`,
    `DELETE FROM work_engagements WHERE "jobId" = ANY($1::text[])`,
    `DELETE FROM applications WHERE "jobId" = ANY($1::text[])`,
    `DELETE FROM saved_jobs WHERE "jobId" = ANY($1::text[])`,
    `DELETE FROM hidden_jobs WHERE "jobId" = ANY($1::text[])`,
    `DELETE FROM job_reports WHERE "jobId" = ANY($1::text[])`,
    `DELETE FROM application_customizations WHERE "jobId" = ANY($1::text[])`,
    `DELETE FROM ai_recommendations WHERE "jobId" = ANY($1::text[])`,
  ];

  for (const sql of dependentDeletes) {
    try {
      const result = await client.query(sql, [jobIds]);
      if (result.rowCount > 0) {
        console.log(`[cleanup-jobs]   cleared ${result.rowCount} rows from ${sql.split(" FROM ")[1]?.split(" ")[0]}`);
      }
    } catch (err) {
      if (err.code === "42P01") continue; // table missing
      throw err;
    }
  }

  const deleted = await client.query(`DELETE FROM jobs WHERE id = ANY($1::text[])`, [jobIds]);
  return deleted.rowCount;
}

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const schema = await detectSchema(client);
    console.log("[cleanup-jobs] schema", schema);

    const keepEmployerIds = await resolveKeepEmployerIds(client, schema);
    if (!keepEmployerIds.length) {
      console.error("[cleanup-jobs] No employer profiles to keep — aborting.");
      process.exit(1);
    }

    const preview = await client.query(
      `
      SELECT j.id, j.title, u.email AS owner_email, j.status
      FROM jobs j
      JOIN employer_profiles ep ON ep.${q(schema.epIdCol)} = j.${q(schema.employerCol)}
      JOIN users u ON u.id = ep.${q(schema.epUserCol)}
      WHERE j.${q(schema.employerCol)}::text <> ALL($1::text[])
      ORDER BY u.email, j."createdAt" DESC
      `,
      [keepEmployerIds],
    );

    console.log(`[cleanup-jobs] Jobs to delete: ${preview.rows.length}`);
    for (const row of preview.rows.slice(0, 25)) {
      console.log(`  - ${row.id} | ${row.status} | ${row.owner_email} | ${row.title}`);
    }
    if (preview.rows.length > 25) {
      console.log(`  ... and ${preview.rows.length - 25} more`);
    }

    const keepCount = await client.query(
      `SELECT count(*)::int AS n FROM jobs WHERE ${q(schema.employerCol)}::text = ANY($1::text[])`,
      [keepEmployerIds],
    );
    console.log(`[cleanup-jobs] Jobs to keep: ${keepCount.rows[0].n}`);

    if (DRY_RUN) {
      console.log("[cleanup-jobs] Dry run — no rows deleted.");
      return;
    }

    if (preview.rows.length === 0) {
      console.log("[cleanup-jobs] Nothing to delete.");
      return;
    }

    const deleted = await deleteJobsAndDependents(client, schema, keepEmployerIds);
    console.log(`[cleanup-jobs] Deleted ${deleted} jobs.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[cleanup-jobs] FAILED", err);
  process.exit(1);
});
