/**
 * Log in as an employer and post jobs from a catalog module.
 *
 * Usage:
 *   npm run seed:kongnyuy-jobs
 *   npm run seed:fabrice-jobs
 *
 * Env:
 *   POST_JOBS_API_URL        — default: NEXT_PUBLIC_API_BASE_URL or http://localhost:8000
 *   POST_JOBS_EMPLOYER_EMAIL
 *   POST_JOBS_EMPLOYER_PASSWORD
 *   SEED_JOBS_CATALOG        — fabrice | kongnyuy (default: fabrice)
 *   SEED_DEPARTMENT_ID       — optional
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import axios from "axios";
import { FABRICE_JOBS } from "./data/fabrice-jobs-catalog.mjs";
import { KONGNYUY_JOBS } from "./data/kongnyuy-jobs-catalog.mjs";
import { buildEmployerJobBody, buildEmployerJobBodyLegacy } from "./lib/employer-job-body.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BACKEND_ROOT = path.resolve(ROOT, "../joballa-backend");

const CATALOGS = {
  fabrice: { jobs: FABRICE_JOBS, email: "fabricekongnyuy2@gmail.com" },
  kongnyuy: { jobs: KONGNYUY_JOBS, email: "kongnyuy98765@gmail.com" },
};

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
loadEnvFile(path.join(BACKEND_ROOT, ".env"));

const catalogKey = (process.env.SEED_JOBS_CATALOG || "fabrice").toLowerCase();
const catalog = CATALOGS[catalogKey];
if (!catalog) {
  console.error(`[employer-jobs] Unknown SEED_JOBS_CATALOG: ${catalogKey}`);
  process.exit(1);
}

const API_URL = (
  process.env.POST_JOBS_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL
)?.trim()?.replace(/\/$/, "");

if (!API_URL) {
  console.error(
    "[employer-jobs] Set NEXT_PUBLIC_API_BASE_URL or API_URL in joballa-web/.env",
  );
  process.exit(1);
}

const EMAIL = process.env.POST_JOBS_EMPLOYER_EMAIL || catalog.email;
const PASSWORD = process.env.POST_JOBS_EMPLOYER_PASSWORD || "Thiago+123.";
const JOBS = catalog.jobs;

function log(step, detail = "") {
  console.log(detail ? `[employer-jobs] ${step} — ${detail}` : `[employer-jobs] ${step}`);
}

function fail(step, err) {
  const payload = err?.response?.data ?? err?.message ?? err;
  console.error(`[employer-jobs] FAILED: ${step}`, err?.response?.status ?? "", payload);
  process.exit(1);
}

function client(token) {
  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true,
    validateStatus: (s) => s < 500,
  });
}

async function login(identifier, password) {
  const api = client();
  const res = await api.post("/auth/login", { identifier, password });
  if (res.status !== 200 && res.status !== 201) {
    throw Object.assign(new Error("Login failed"), { response: res });
  }
  const token = res.data?.accessToken;
  if (!token) throw new Error("Login response missing accessToken");
  return token;
}

async function detectApiMode(token) {
  const api = client(token);
  const v2 = await api.get("/employer/me");
  if (v2.status === 200) return { mode: "v2", jobsPath: "/employer/jobs", mePath: "/employer/me" };
  const v1 = await api.get("/api/employer/me");
  if (v1.status === 200) return { mode: "v1", jobsPath: "/api/employer/jobs", mePath: "/api/employer/me" };
  fail("api-detect", new Error(`Could not reach employer API at ${API_URL}`));
}

function resolveDepartmentIdFromDb() {
  if (process.env.SEED_DEPARTMENT_ID) return process.env.SEED_DEPARTMENT_ID;

  const script = `
import { getPrisma, disconnectPrisma } from './scripts/employer-portal/lib/prisma.mjs';
const prisma = getPrisma();
try {
  let dept = await prisma.department.findFirst({
    where: { category: 'SOFTWARE_TECH', isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!dept) dept = await prisma.department.findFirst({ where: { slug: 'other' } });
  if (!dept) dept = await prisma.department.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!dept) {
    dept = await prisma.department.create({
      data: {
        name: 'Software & Technology',
        slug: 'software-tech',
        category: 'SOFTWARE_TECH',
        description: 'Seeded for employer job postings',
      },
    });
  }
  process.stdout.write(dept.id);
} finally {
  await disconnectPrisma();
}
`;

  const result = spawnSync("node", ["--input-type=module", "-e", script], {
    cwd: BACKEND_ROOT,
    encoding: "utf8",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "Could not resolve departmentId from database");
  }

  const id = result.stdout.trim();
  if (!id) throw new Error("No departmentId returned from database");
  return id;
}

async function main() {
  log("catalog", catalogKey);
  log("API", API_URL);
  log("account", EMAIL);

  let token;
  try {
    token = await login(EMAIL, PASSWORD);
    log("login", "OK");
  } catch (e) {
    fail("login", e);
  }

  const apiInfo = await detectApiMode(token);
  log("api-mode", apiInfo.mode);

  const employerApi = client(token);

  const me = await employerApi.get(apiInfo.mePath);
  if (me.status === 200) {
    const company =
      me.data?.employerProfile?.companyName ??
      me.data?.company?.name ??
      me.data?.email ??
      "employer";
    log("employer", company);
  }

  let departmentId;
  if (apiInfo.mode === "v2") {
    try {
      departmentId = resolveDepartmentIdFromDb();
      log("department", departmentId);
    } catch (e) {
      fail("department", e);
    }
  }

  const created = [];

  log("jobs", `posting ${JOBS.length} jobs`);
  for (let i = 0; i < JOBS.length; i++) {
    const template = JOBS[i];
    const body =
      apiInfo.mode === "v2"
        ? buildEmployerJobBody(template, departmentId)
        : buildEmployerJobBodyLegacy(template);

    let res;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await employerApi.post(apiInfo.jobsPath, body);
        break;
      } catch (err) {
        if (attempt === 3 || err.code !== "ECONNRESET") throw err;
        log("retry", `job ${i + 1} attempt ${attempt + 1} after connection reset`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    if (res.status !== 201) {
      fail(`create job ${i + 1} (${template.title})`, { response: res });
    }
    const jobId = res.data?.jobId ?? res.data?.id;
    const status = res.data?.status ?? "unknown";
    log("created", `${i + 1}. ${template.title} → ${jobId} (${status})`);
    if (jobId) created.push(jobId);
  }

  console.log("\n[employer-jobs] Done.");
  console.log(`[employer-jobs] Posted ${created.length} jobs for ${EMAIL} on ${API_URL}`);
  for (const id of created) {
    console.log(`  - ${id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
