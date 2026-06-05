/**
 * Seeds the Joballa database through the REST API (writes real rows in PostgreSQL).
 *
 * Prerequisites:
 * - API running (local :8000 or Render) with same DATABASE_URL as your DB
 * - Employer + worker accounts (login), optional admin to approve jobs
 * - Set NEXT_PUBLIC_USE_DEMO_DATA=false in .env so the web app reads the API
 *
 * Usage:
 *   npm run seed:demo
 *
 * Env (see docs/SEED_DATABASE.md):
 *   SEED_API_URL, SEED_EMPLOYER_EMAIL, SEED_EMPLOYER_PASSWORD,
 *   SEED_WORKER_EMAIL, SEED_WORKER_PASSWORD,
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (recommended)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import {
  JOB_TEMPLATES,
  WORKER_PROFILE_PATCHES,
  buildEmployerJobBody,
} from "./data/seed-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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
    /* no .env */
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const API_URL = (
  process.env.SEED_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const JOB_COUNT = Number(process.env.SEED_JOB_COUNT ?? "22");
const SKIP_JOB_CREATE = process.env.SEED_SKIP_JOBS === "1";
const APPLY_COUNT = Number(process.env.SEED_APPLY_COUNT || "18");
const SAVE_COUNT = Number(process.env.SEED_SAVE_COUNT || "10");
const SHORTLIST_COUNT = Number(process.env.SEED_SHORTLIST_COUNT || "14");
const HIRE_COUNT = Number(process.env.SEED_HIRE_COUNT || "6");

function log(step, detail = "") {
  const msg = detail ? `[seed] ${step} — ${detail}` : `[seed] ${step}`;
  console.log(msg);
}

function fail(step, err) {
  const status = err.response?.status;
  const data = err.response?.data;
  console.error(`[seed] FAILED: ${step}`, status ?? "", data ?? err.message);
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

async function registerAndVerify(email, password, role, otp) {
  const api = client();
  const reg = await api.post("/auth/register", {
    email,
    password,
    role,
    preferredLanguage: "EN",
  });
  if (reg.status >= 400) throw Object.assign(new Error("Register failed"), { response: reg });

  const verify = await api.post("/auth/verify", {
    identifier: email,
    otp,
    role,
    password,
    preferredLanguage: "EN",
  });
  if (verify.status !== 200 && verify.status !== 201) {
    throw Object.assign(new Error("Verify failed"), { response: verify });
  }
  return verify.data.accessToken;
}

async function main() {
  log("API", API_URL);

  const employerId = process.env.SEED_EMPLOYER_EMAIL;
  const employerPass = process.env.SEED_EMPLOYER_PASSWORD;
  const workerId = process.env.SEED_WORKER_EMAIL;
  const workerPass = process.env.SEED_WORKER_PASSWORD;
  const adminId = process.env.SEED_ADMIN_EMAIL;
  const adminPass = process.env.SEED_ADMIN_PASSWORD;
  const devOtp = process.env.SEED_DEV_OTP || process.env.JOBALLA_DEV_FIXED_OTP;

  if (!employerId || !employerPass || !workerId || !workerPass) {
    console.error(
      "[seed] Set SEED_EMPLOYER_EMAIL, SEED_EMPLOYER_PASSWORD, SEED_WORKER_EMAIL, SEED_WORKER_PASSWORD in .env",
    );
    console.error("[seed] Or use SEED_REGISTER=1 with SEED_DEV_OTP for local API only.");
    process.exit(1);
  }

  let employerToken;
  let workerToken;
  let adminToken;

  try {
    if (process.env.SEED_REGISTER === "1" && devOtp) {
      const ts = Date.now();
      const empEmail = process.env.SEED_EMPLOYER_EMAIL || `employer.seed.${ts}@joballa.test`;
      const wrkEmail = process.env.SEED_WORKER_EMAIL || `worker.seed.${ts}@joballa.test`;
      const pass = employerPass || "SeedDemo2026!";
      log("register", `employer ${empEmail}`);
      employerToken = await registerAndVerify(empEmail, pass, "EMPLOYER", devOtp);
      log("register", `worker ${wrkEmail}`);
      workerToken = await registerAndVerify(wrkEmail, pass, "WORKER", devOtp);
    } else {
      log("login", "employer");
      employerToken = await login(employerId, employerPass);
      log("login", "worker");
      workerToken = await login(workerId, workerPass);
    }

    if (adminId && adminPass) {
      log("login", "admin");
      adminToken = await login(adminId, adminPass);
    }
  } catch (e) {
    fail("auth", e);
  }

  const employerApi = client(employerToken);
  const workerApi = client(workerToken);
  const adminApi = adminToken ? client(adminToken) : null;

  const createdJobIds = [];

  if (!SKIP_JOB_CREATE) {
  log("jobs", `creating ${JOB_COUNT} postings`);
  for (let i = 0; i < JOB_COUNT; i++) {
    const template = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    const body = buildEmployerJobBody(template, i);
    try {
      const res = await employerApi.post("/api/employer/jobs", body);
      if (res.status !== 201) {
        fail(`create job ${i + 1}`, { response: res });
      }
      const jobId = res.data?.jobId;
      if (jobId) createdJobIds.push(jobId);
    } catch (e) {
      fail(`create job ${i + 1}`, e);
    }
  }
  log("jobs", `created ${createdJobIds.length} (pending admin review)`);
  } else {
    log("jobs", "skipped (SEED_SKIP_JOBS=1)");
  }

  const jobIdsToUse = [...createdJobIds];

  log("publish", "attempting to set employer jobs to live");
  const employerJobsRes = await employerApi.get("/api/employer/jobs", { params: { limit: 80, page: 1 } });
  if (employerJobsRes.status === 200 && Array.isArray(employerJobsRes.data?.items)) {
    let published = 0;
    for (const item of employerJobsRes.data.items) {
      const jobId = item.jobId ?? item.id;
      if (!jobId) continue;
      if (!jobIdsToUse.includes(jobId)) jobIdsToUse.push(jobId);
      const st = String(item.status ?? "");
      if (st === "live" || st === "ACTIVE") {
        published++;
        continue;
      }
      const patch = await employerApi.patch(`/api/employer/jobs/${jobId}/status`, { status: "live" });
      if (patch.status === 200) published++;
    }
    log("publish", `${published} jobs live (or already live)`);
  }

  if (adminApi) {
    log("approve", "fetching moderation queue");
    const queue = await adminApi.get("/admin/jobs", {
      params: { moderationQueue: true, limit: 50, page: 1 },
    });
    if (queue.status === 200 && Array.isArray(queue.data?.items)) {
      for (const item of queue.data.items) {
        const id = item.id ?? item.jobId;
        if (!id) continue;
        const approve = await adminApi.post(`/admin/jobs/${id}/approve`, {
          note: "Approved for demo seed dataset",
        });
        if (approve.status === 200 || approve.status === 201) {
          if (!jobIdsToUse.includes(id)) jobIdsToUse.push(id);
        }
      }
      log("approve", `processed ${queue.data.items.length} queue items`);
    } else {
      log("approve", `skipped (${queue.status}) — set admin credentials or approve jobs manually`);
    }
  } else {
    log(
      "approve",
      "no SEED_ADMIN_* — jobs stay pending_review until an admin approves them (worker search only shows ACTIVE jobs)",
    );
  }

  log("profile", "enriching worker profile");
  const profileSteps = [
    ["personal-info", WORKER_PROFILE_PATCHES.personal],
    ["professional-summary", WORKER_PROFILE_PATCHES.summary],
    ["skills", WORKER_PROFILE_PATCHES.skills],
    ["payment-details", WORKER_PROFILE_PATCHES.payment],
  ];
  for (const [segment, body] of profileSteps) {
    const res = await workerApi.patch(`/api/worker/profile/${segment}`, body);
    if (res.status !== 200) fail(`profile ${segment}`, { response: res });
  }
  const wh = await workerApi.post("/api/worker/profile/work-history", WORKER_PROFILE_PATCHES.workHistory);
  if (wh.status !== 200 && wh.status !== 201) fail("work-history", { response: wh });

  const liveJobsRes = await workerApi.get("/api/jobs", { params: { limit: 50, page: 1 } });
  let searchableIds = [];
  if (liveJobsRes.status === 200 && Array.isArray(liveJobsRes.data?.items)) {
    searchableIds = liveJobsRes.data.items.map((j) => j.id).filter(Boolean);
  }
  if (searchableIds.length === 0) {
    searchableIds = jobIdsToUse;
    log("apply", "no ACTIVE jobs in search yet — using created job ids (apply may 404 until approved)");
  }

  const toApply = searchableIds.slice(0, APPLY_COUNT);
  let applied = 0;
  for (const jobId of toApply) {
    const res = await workerApi.post(`/api/jobs/${jobId}/apply`, {
      jobSpecificNote: "Interested — available to start within two weeks.",
    });
    if (res.status === 200 || res.status === 201) applied++;
    else if (res.status === 409) {
      /* already applied */
    }
  }
  log("apply", `${applied} applications submitted`);

  let saved = 0;
  for (const jobId of searchableIds.slice(0, SAVE_COUNT)) {
    const res = await workerApi.post(`/api/jobs/${jobId}/save`);
    if (res.status === 200 || res.status === 201) saved++;
  }
  log("saved", `${saved} jobs saved`);

  if (employerApi) {
    const appsRes = await employerApi.get("/api/employer/applicants", {
      params: { limit: 50, page: 1, sort: "recent" },
    });
    if (appsRes.status === 200 && Array.isArray(appsRes.data?.items)) {
      const items = appsRes.data.items;
      let shortlisted = 0;
      let hired = 0;
      for (let i = 0; i < items.length && i < SHORTLIST_COUNT; i++) {
        const appId = items[i].applicationId ?? items[i].id;
        if (!appId) continue;
        const res = await employerApi.patch(`/api/employer/applicants/${appId}/status`, {
          status: "shortlisted",
        });
        if (res.status === 200) shortlisted++;
      }
      for (let i = 0; i < items.length && i < HIRE_COUNT; i++) {
        const appId = items[i].applicationId ?? items[i].id;
        if (!appId) continue;
        const res = await employerApi.patch(`/api/employer/applicants/${appId}/status`, {
          status: "hired",
        });
        if (res.status === 200) hired++;
      }
      log("employer", `${shortlisted} shortlisted, ${hired} hired (workforce + engagements)`);
    }
  }

  console.log("\n[seed] Done. Set NEXT_PUBLIC_USE_DEMO_DATA=false and sign in with your seed accounts.");
  console.log(`[seed] Employer: ${employerId}`);
  console.log(`[seed] Worker:   ${workerId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
