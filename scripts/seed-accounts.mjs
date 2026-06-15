/**
 * Seeds Tech Chantier (employer, IT jobs) and teaching-focused worker account via API.
 *
 *   npm run seed:accounts
 *
 * Env (defaults match project accounts when set in .env):
 *   SEED_TECH_CHANTIER_EMAIL, SEED_TECH_CHANTIER_PASSWORD
 *   SEED_TEACHING_WORKER_EMAIL, SEED_TEACHING_WORKER_PASSWORD
 *   SEED_API_URL, SEED_DEV_OTP (for SEED_REGISTER=1)
 *   SEED_SKIP_JOBS=1 — skip job creation
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import { buildEmployerJobBody } from "./data/seed-catalog.mjs";
import {
  HEALTH_ORG_COMPANY,
  HEALTH_ORG_JOBS,
  TECH_CHANTIER_COMPANY,
  TECH_CHANTIER_IT_JOBS,
  TEACHING_JOB_TEMPLATES,
  TEACHING_WORKER_PROFILE,
} from "./data/seed-accounts-catalog.mjs";

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
    /* no file */
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const API_URL = (
  process.env.SEED_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL
)?.trim()?.replace(/\/$/, "");

if (!API_URL) {
  console.error(
    "[seed:accounts] Set NEXT_PUBLIC_API_BASE_URL or API_URL in joballa-web/.env",
  );
  process.exit(1);
}

const SKIP_JOBS = process.env.SEED_SKIP_JOBS === "1";
const SEED_TEACHING_JOBS = process.env.SEED_TEACHING_JOBS !== "0";

function log(step, detail = "") {
  console.log(detail ? `[seed:accounts] ${step} — ${detail}` : `[seed:accounts] ${step}`);
}

function fail(step, err) {
  console.error(`[seed:accounts] FAILED: ${step}`, err.response?.status ?? "", err.response?.data ?? err.message);
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

async function resolveToken(email, password, role, devOtp) {
  try {
    return await login(email, password);
  } catch (e) {
    if (process.env.SEED_REGISTER === "1" && devOtp) {
      log("register", `${role} ${email}`);
      return registerAndVerify(email, password, role, devOtp);
    }
    throw e;
  }
}

async function publishEmployerJobs(employerApi) {
  const res = await employerApi.get("/api/employer/jobs", { params: { limit: 100, page: 1 } });
  if (res.status !== 200 || !Array.isArray(res.data?.items)) return 0;
  let published = 0;
  for (const item of res.data.items) {
    const jobId = item.jobId ?? item.id;
    if (!jobId) continue;
    const st = String(item.status ?? "");
    if (st === "live" || st === "ACTIVE") {
      published++;
      continue;
    }
    const patch = await employerApi.patch(`/api/employer/jobs/${jobId}/status`, { status: "live" });
    if (patch.status === 200) published++;
  }
  return published;
}

async function createJobs(employerApi, templates, labelPrefix = "") {
  const ids = [];
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const body = buildEmployerJobBody(template, i);
    if (labelPrefix) {
      body.title = `${labelPrefix}${body.title}`;
      body.description = `${labelPrefix} ${body.description}`;
    }
    const res = await employerApi.post("/api/employer/jobs", body);
    if (res.status !== 201) fail(`create ${labelPrefix || "job"} ${i + 1}`, { response: res });
    const jobId = res.data?.jobId;
    if (jobId) ids.push(jobId);
  }
  return ids;
}

async function seedTechChantier(email, password, devOtp) {
  log("tech-chantier", email);
  const token = await resolveToken(email, password, "EMPLOYER", devOtp);
  const api = client(token);

  const companyRes = await api.patch("/api/employer/company", TECH_CHANTIER_COMPANY);
  if (companyRes.status !== 200) fail("tech-chantier company", { response: companyRes });
  log("tech-chantier", "company profile updated (logo + bio)");

  if (!SKIP_JOBS) {
    const itIds = await createJobs(api, TECH_CHANTIER_IT_JOBS);
    log("tech-chantier", `${itIds.length} IT jobs created`);

    if (SEED_TEACHING_JOBS) {
      const teachIds = await createJobs(api, TEACHING_JOB_TEMPLATES, "[Education] ");
      log("tech-chantier", `${teachIds.length} teaching jobs created (education division)`);
    }

    const published = await publishEmployerJobs(api);
    log("tech-chantier", `${published} jobs live`);
  } else {
    log("tech-chantier", "jobs skipped (SEED_SKIP_JOBS=1)");
  }
}

async function seedHealthOrganization(email, password, devOtp) {
  log("health-org", email);
  const token = await resolveToken(email, password, "EMPLOYER", devOtp);
  const api = client(token);

  const companyRes = await api.patch("/api/employer/company", HEALTH_ORG_COMPANY);
  if (companyRes.status !== 200) fail("health-org company", { response: companyRes });
  log("health-org", "company profile updated");

  if (!SKIP_JOBS) {
    const jobIds = await createJobs(api, HEALTH_ORG_JOBS);
    log("health-org", `${jobIds.length} healthcare jobs created`);
    const published = await publishEmployerJobs(api);
    log("health-org", `${published} jobs live`);
  } else {
    log("health-org", "jobs skipped (SEED_SKIP_JOBS=1)");
  }
}

async function seedTeachingWorker(email, password, devOtp) {
  log("teaching-worker", email);
  const token = await resolveToken(email, password, "WORKER", devOtp);
  const api = client(token);

  const steps = [
    ["personal-info", TEACHING_WORKER_PROFILE.personal],
    ["professional-summary", TEACHING_WORKER_PROFILE.summary],
    ["skills", TEACHING_WORKER_PROFILE.skills],
    ["payment-details", TEACHING_WORKER_PROFILE.payment],
  ];
  for (const [segment, body] of steps) {
    const res = await api.patch(`/api/worker/profile/${segment}`, body);
    if (res.status !== 200) fail(`worker profile ${segment}`, { response: res });
  }
  const wh = await api.post("/api/worker/profile/work-history", TEACHING_WORKER_PROFILE.workHistory);
  if (wh.status !== 200 && wh.status !== 201) fail("worker work-history", { response: wh });
  log("teaching-worker", "profile enriched (education focus)");

  const jobsRes = await api.get("/api/jobs", {
    params: { limit: 50, page: 1, keyword: "tutor" },
  });
  let jobIds = [];
  if (jobsRes.status === 200 && Array.isArray(jobsRes.data?.items)) {
    jobIds = jobsRes.data.items
      .filter((j) => /tutor|teacher|instructor|educat|mentor|teaching/i.test(String(j.title ?? "")))
      .map((j) => j.id)
      .filter(Boolean);
  }
  if (jobIds.length === 0 && jobsRes.status === 200 && Array.isArray(jobsRes.data?.items)) {
    jobIds = jobsRes.data.items.map((j) => j.id).filter(Boolean).slice(0, 6);
  }

  let applied = 0;
  for (const jobId of jobIds.slice(0, 6)) {
    const res = await api.post(`/api/jobs/${jobId}/apply`, {
      jobSpecificNote: "Experienced tutor — available for evening and weekend sessions.",
    });
    if (res.status === 200 || res.status === 201) applied++;
  }
  log("teaching-worker", `${applied} applications on teaching-related jobs`);

  let saved = 0;
  for (const jobId of jobIds.slice(0, 4)) {
    const res = await api.post(`/api/jobs/${jobId}/save`);
    if (res.status === 200 || res.status === 201) saved++;
  }
  log("teaching-worker", `${saved} jobs saved`);
}

async function main() {
  log("API", API_URL);

  const techEmail =
    process.env.SEED_TECH_CHANTIER_EMAIL || "takemjimreepls@gmail.com";
  const techPass = process.env.SEED_TECH_CHANTIER_PASSWORD;
  const workerEmail =
    process.env.SEED_TEACHING_WORKER_EMAIL || "tjanonymous39@gmail.com";
  const workerPass = process.env.SEED_TEACHING_WORKER_PASSWORD;
  const healthEmail =
    process.env.SEED_HEALTH_EMPLOYER_EMAIL || "takemfamily2025@gmail.com";
  const healthPass = process.env.SEED_HEALTH_EMPLOYER_PASSWORD;
  const devOtp = process.env.SEED_DEV_OTP || process.env.JOBALLA_DEV_FIXED_OTP;

  const runTech = Boolean(techPass);
  const runWorker = Boolean(workerPass);
  const runHealth = Boolean(healthPass);

  if (!runTech && !runWorker && !runHealth) {
    console.error(
      "[seed:accounts] Set at least one password: SEED_TECH_CHANTIER_PASSWORD, SEED_TEACHING_WORKER_PASSWORD, SEED_HEALTH_EMPLOYER_PASSWORD",
    );
    console.error("[seed:accounts] Or use SEED_REGISTER=1 with SEED_DEV_OTP for local API.");
    process.exit(1);
  }

  try {
    if (runTech) await seedTechChantier(techEmail, techPass, devOtp);
    if (runHealth) await seedHealthOrganization(healthEmail, healthPass, devOtp);
    if (runWorker) await seedTeachingWorker(workerEmail, workerPass, devOtp);
  } catch (e) {
    fail("accounts", e);
  }

  console.log("\n[seed:accounts] Done.");
  if (runTech) console.log(`[seed:accounts] Employer (Tech Chantier):  ${techEmail}`);
  if (runHealth) console.log(`[seed:accounts] Employer (Health org):    ${healthEmail}`);
  if (runWorker) console.log(`[seed:accounts] Worker (teaching):         ${workerEmail}`);
  console.log("[seed:accounts] Sign in with the seeded accounts above.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
