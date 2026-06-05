import type {
  EarningTransaction,
  EarningsSummary,
  SavedJobItem,
  WorkerApplicationDetail,
  WorkerApplicationListItem,
  WorkerEngagementListItem,
  WorkerFullProfile,
  WorkerJobDetail,
  WorkerJobListItem,
  WorkerMe,
} from "@/features/worker/types/worker-portal";

const COMPANIES = [
  { id: "emp-1", companyName: "TechCo Cameroun" },
  { id: "emp-2", companyName: "Joballa Education" },
  { id: "emp-3", companyName: "Creative Hub CM" },
  { id: "emp-4", companyName: "AgriGrow West" },
  { id: "emp-5", companyName: "Douala Logistics" },
  { id: "emp-6", companyName: "Savanna Events" },
  { id: "emp-7", companyName: "Buea Health Network" },
  { id: "emp-8", companyName: "Kribi Hospitality Group" },
] as const;

const TITLES = [
  "Admin Assistant",
  "Marketing Specialist",
  "Graphic Designer",
  "Home Tutor — Math & English",
  "Software Engineer",
  "Logistics Coordinator",
  "Field Sales Representative",
  "Customer Support Agent",
  "Warehouse Supervisor",
  "Social Media Manager",
  "Electrician",
  "Nurse Assistant",
  "Data Entry Clerk",
  "Restaurant Server",
  "Delivery Rider",
  "HR Coordinator",
  "Content Writer",
  "Photographer",
  "Event Host",
  "Farm Supervisor",
  "Security Guard",
  "Barista",
  "Translator (EN/FR)",
  "UX Research Assistant",
  "Payroll Clerk",
  "Construction Helper",
  "Video Editor",
  "Call Center Agent",
  "Inventory Auditor",
  "Teaching Assistant",
  "Driver — Company Fleet",
  "Cleaner — Commercial Sites",
  "Receptionist",
  "Accounting Intern",
  "Community Manager",
];

const CITIES = ["Yaoundé", "Douala", "Buea", "Limbe", "Bamenda", "Garoua", "Kribi", "Maroua"];
const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"] as const;
const WORK_MODES = ["ON_SITE", "REMOTE", "HYBRID"] as const;
const APP_STATUSES = ["PENDING", "SHORTLISTED", "REJECTED", "HIRED"] as const;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function buildJob(index: number): WorkerJobListItem {
  const company = COMPANIES[index % COMPANIES.length]!;
  const city = CITIES[index % CITIES.length]!;
  const jobType = JOB_TYPES[index % JOB_TYPES.length]!;
  const workMode = WORK_MODES[index % WORK_MODES.length]!;
  const payRate = 35000 + (index % 12) * 15000;
  return {
    id: `demo-job-${index + 1}`,
    title: TITLES[index % TITLES.length]!,
    description: `Demo role #${index + 1} at ${company.companyName}. Clear objectives, weekly check-ins, and professional workplace standards.`,
    city,
    category: ["Administration", "Marketing", "Technology", "Education", "Logistics"][index % 5],
    jobType,
    workMode,
    payStructure: index % 3 === 0 ? "HOURLY" : "MONTHLY",
    payRate,
    currency: "XAF",
    employer: company,
    companyName: company.companyName,
    isSaved: index % 4 === 0,
    createdAt: daysAgo((index % 28) + 1),
    applicationCount: 3 + (index % 15),
    requirements: [
      "Relevant experience or strong transferable skills",
      "Reliable attendance and communication",
      "Comfort working in English and French",
    ],
    responsibilities: [
      "Deliver tasks described in the role brief",
      "Coordinate with the hiring team on schedule",
      "Maintain professional standards on site",
    ],
  };
}

export function createDemoJobs(count = 36): WorkerJobListItem[] {
  return Array.from({ length: count }, (_, i) => buildJob(i));
}

export function createDemoApplications(jobs: WorkerJobListItem[]): WorkerApplicationListItem[] {
  return Array.from({ length: 28 }, (_, i) => {
    const job = jobs[i % jobs.length]!;
    const status = APP_STATUSES[i % APP_STATUSES.length]!;
    return {
      id: `demo-app-${i + 1}`,
      status,
      jobId: job.id,
      job,
      jobTitle: job.title,
      companyName: job.companyName ?? job.employer?.companyName,
      appliedAt: daysAgo((i % 20) + 1),
      createdAt: daysAgo((i % 20) + 1),
    };
  });
}

export function createDemoEngagements(jobs: WorkerJobListItem[]): WorkerEngagementListItem[] {
  return Array.from({ length: 10 }, (_, i) => {
    const job = jobs[i + 3]!;
    return {
      id: `demo-eng-${i + 1}`,
      status: i % 2 === 0 ? "ACTIVE" : "COMPLETED",
      job,
      employer: job.employer,
      startedAt: daysAgo(30 + i * 5),
    };
  });
}

export function createDemoTransactions(): EarningTransaction[] {
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "PENDING", "FAILED"] as const;
  return Array.from({ length: 48 }, (_, i) => ({
    id: `demo-txn-${i + 1}`,
    amount: 25000 + (i % 20) * 8000,
    currency: "XAF",
    status: statuses[i % statuses.length],
    initiatedAt: daysAgo(i % 45),
    completedAt: i % 5 === 3 ? null : daysAgo(i % 45),
    employerName: COMPANIES[i % COMPANIES.length]!.companyName,
    jobTitle: TITLES[i % TITLES.length],
  }));
}

export const DEMO_WORKER_ME: WorkerMe = {
  id: "demo-worker-user-1",
  email: "ako.james@demo.joballa.test",
  phone: "+237 6 77 00 12 34",
  role: "WORKER",
  languagePreference: "en",
  workerProfile: {
    id: "demo-worker-profile-1",
    fullName: "Ako James Ngu",
    city: "Yaoundé",
    region: "Centre",
    professionalTitle: "Marketing & Operations Specialist",
    profileCompleteness: 78,
    availabilityStatus: "AVAILABLE",
    verificationStatus: "VERIFIED",
    avatarUrl: null,
  },
};

export const DEMO_WORKER_PROFILE: WorkerFullProfile = {
  id: "demo-worker-profile-1",
  userId: "demo-worker-user-1",
  firstName: "Ako",
  lastName: "James Ngu",
  fullName: "Ako James Ngu",
  city: "Yaoundé",
  region: "Centre",
  country: "Cameroon",
  languages: ["English", "French"],
  availabilityStatus: "AVAILABLE",
  professionalTitle: "Marketing & Operations Specialist",
  summary:
    "Five years coordinating campaigns, client onboarding, and field teams across Centre and Littoral regions. Comfortable with MoMo payroll flows and bilingual stakeholder communication.",
  industries: ["Marketing", "Education", "Logistics"],
  preferredJobTypes: ["FULL_TIME", "PART_TIME", "CONTRACT"],
  skills: ["Excel", "Canva", "Customer support", "Social media", "Sales", "French", "English"],
  profileCompleteness: 78,
  avatarUrl: null,
  mobileMoneyProvider: "MTN_MOMO",
  mobileMoneyNumber: "+237 677 001 234",
  workHistories: [
    {
      id: "wh-1",
      jobTitle: "Marketing Coordinator",
      companyName: "Joballa Education",
      startDate: "2022-03-01",
      endDate: null,
      description: "Owned social campaigns and partner outreach for training programs.",
    },
    {
      id: "wh-2",
      jobTitle: "Operations Assistant",
      companyName: "TechCo Cameroun",
      startDate: "2019-06-01",
      endDate: "2022-01-31",
      description: "Supported scheduling, vendor invoices, and weekly reporting.",
    },
    {
      id: "wh-3",
      jobTitle: "Field Promoter",
      companyName: "Savanna Events",
      startDate: "2017-01-01",
      endDate: "2019-04-30",
    },
  ],
  educations: [
    {
      id: "edu-1",
      institution: "University of Buea",
      degree: "BSc",
      fieldOfStudy: "Management",
      startDate: "2013-09-01",
      endDate: "2017-06-30",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Google Digital Marketing",
      issuer: "Google",
      issueDate: "2023-05-01",
    },
  ],
  documents: [
    { id: "doc-1", type: "CV", fileName: "Ako_James_CV.pdf", url: "#", createdAt: daysAgo(40) },
    { id: "doc-2", type: "CERTIFICATE", fileName: "Digital_Marketing_Cert.pdf", url: "#", createdAt: daysAgo(120) },
  ],
  kycSubmissions: [{ id: "kyc-1", documentType: "NATIONAL_ID", status: "VERIFIED", createdAt: daysAgo(200) }],
};

export const DEMO_EARNINGS_SUMMARY: EarningsSummary = {
  totalEarned: 1_245_000,
  totalPayments: 42,
  pendingAmount: 185_000,
  thisMonthTotal: 312_000,
  currency: "XAF",
};

export function jobToDetail(job: WorkerJobListItem): WorkerJobDetail {
  return {
    ...job,
    neighbourhood: "Central district",
    startDate: daysAgo(-14),
    duration: "9 months",
  } as WorkerJobDetail;
}

export function applicationToDetail(app: WorkerApplicationListItem): WorkerApplicationDetail {
  return {
    ...app,
    jobSpecificNote: "Happy to start within two weeks and can provide references on request.",
    employer: app.job?.employer,
  };
}

export function savedFromJobs(jobs: WorkerJobListItem[]): SavedJobItem[] {
  return jobs
    .filter((j) => j.isSaved)
    .map((job) => ({
      jobId: job.id,
      savedAt: daysAgo(2),
      job,
    }));
}
