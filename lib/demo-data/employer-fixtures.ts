import type {
  EmployerApplicantDetail,
  EmployerApplicantFilters,
  EmployerApplicantListItem,
  EmployerApplicantStatus,
  EmployerCompany,
  EmployerDashboard,
  EmployerJobDetail,
  EmployerJobListItem,
  EmployerMe,
  EmployerPaymentHistoryItem,
  EmployerPayWorkersResponse,
  EmployerPaymentsSummary,
  EmployerShift,
  EmployerWorkforceList,
  EmployerWorkforceListItem,
} from "@/features/employer/types/employer-portal";

const FIRST = [
  "Ako",
  "Marie",
  "Jean",
  "Fatou",
  "Eric",
  "Clarisse",
  "Paul",
  "Grace",
  "Samuel",
  "Nadia",
  "Ibrahim",
  "Chantal",
  "David",
  "Amina",
  "Patrick",
];
const LAST = [
  "Ngu",
  "Fouda",
  "Mbarga",
  "Diallo",
  "Tchinda",
  "Ngassa",
  "Abena",
  "Kamga",
  "Etoa",
  "Mballa",
  "Oumar",
  "Essomba",
  "Nkodo",
  "Bello",
  "Atangana",
];

const SKILLS = [
  "Excel, CRM, French",
  "Canva, Social media, Sales",
  "JavaScript, React, English",
  "Customer support, MoMo, Logistics",
  "Teaching, Math, English",
  "Photography, Events, Editing",
  "Warehouse, Inventory, Forklift",
  "Nursing aide, First aid, Care",
  "Driving, Fleet, GPS routing",
  "Accounting, QuickBooks, Payroll",
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_EMPLOYER_ME: EmployerMe = {
  id: "demo-employer-user-1",
  firstName: "Sarah",
  lastName: "Mbeki",
  email: "sarah.mbeki@techco.demo",
  phone: "+237 6 99 44 22 11",
  languagePreference: "en",
  company: { id: "demo-company-1", name: "TechCo Cameroun", logo: null },
  roles: "EMPLOYER",
};

export const DEMO_EMPLOYER_COMPANY: EmployerCompany = {
  id: "demo-company-1",
  name: "TechCo Cameroun",
  industry: "Technology",
  size: "51-200",
  tagline: "Building reliable teams across Cameroon.",
  bio: "TechCo Cameroun partners with growing businesses to hire, onboard, and pay skilled workers. We focus on transparent hiring, verified profiles, and fast payouts through mobile money.",
  location: { city: "Douala", country: "Cameroon" },
  website: "https://techco.demo.joballa",
  logo: null,
  verificationStatus: "VERIFIED",
  applicantsCount: 52,
  employeesCount: 6,
};

const JOB_TITLES = [
  "Admin Assistant",
  "Marketing Specialist",
  "Software Engineer",
  "Field Sales Rep",
  "Customer Support Agent",
  "Warehouse Supervisor",
  "Graphic Designer",
  "HR Coordinator",
  "Logistics Coordinator",
  "Social Media Manager",
  "Electrician",
  "Data Entry Clerk",
  "Delivery Rider",
  "Content Writer",
  "Event Host",
];

const JOB_STATUSES = ["live", "live", "live", "live", "paused", "pending_review", "draft", "closed"] as const;

export function createDemoEmployerJobs(count = 18): EmployerJobListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    jobId: `demo-emp-job-${i + 1}`,
    title: JOB_TITLES[i % JOB_TITLES.length]!,
    location: ["Yaoundé", "Douala", "Buea", "Limbe"][i % 4],
    jobType: ["Full-time", "Part-time", "Contract"][i % 3],
    salary: `${(85 + i * 12) * 1000} XAF/mo`,
    status: JOB_STATUSES[i % JOB_STATUSES.length],
    applicantsCount: 8 + (i % 22),
    shortlistedCount: 2 + (i % 6),
    postedAt: daysAgo((i % 20) + 1),
  }));
}

export function createDemoApplicants(jobs: EmployerJobListItem[]): EmployerApplicantListItem[] {
  const statuses: EmployerApplicantStatus[] = ["pending", "shortlisted", "rejected", "hired", "pending"];
  return Array.from({ length: 52 }, (_, i) => {
    const job = jobs[i % jobs.length]!;
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[i % LAST.length]!;
    const base: EmployerApplicantListItem = {
      applicationId: `demo-emp-app-${i + 1}`,
      id: `demo-emp-app-${i + 1}`,
      applicantName: `${first} ${last}`,
      name: `${first} ${last}`,
      jobTitle: job.title,
      jobId: job.jobId,
      status: statuses[i % statuses.length],
      appliedAt: daysAgo((i % 25) + 1),
      location: job.location,
      jobType: job.jobType,
      matchScore: 55 + (i % 45),
      match: `${55 + (i % 45)}%`,
      topSkills: SKILLS[i % SKILLS.length],
      skills: SKILLS[i % SKILLS.length]!.split(", "),
    };

    if (i === 0) {
      return {
        ...base,
        applicantName: "Musa Diallo",
        name: "Musa Diallo",
        jobTitle: "Backend Developer",
        appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        location: "Douala, Cameroon",
        matchScore: 90,
        match: "90%",
        topSkills: "Node.js, Docker, Problem Solving",
        skills: ["Node.js", "Docker", "Problem Solving"],
        verificationStatus: "VERIFIED",
        submittedProfile: {
          fullName: "Musa Diallo",
          headline: "Backend Developer, DevOps",
          verificationStatus: "VERIFIED",
        },
      };
    }

    return base;
  });
}

const DEMO_WORKFORCE_CORE: Array<{
  fullName: string;
  role: string;
  status: "active" | "terminated" | "rejected";
  dateJoined: string;
  shiftsLogged: number;
  jobType: string;
}> = [
  {
    fullName: "Musa Diallo",
    role: "Backend Developer",
    status: "active",
    dateJoined: "2026-05-01",
    shiftsLogged: 12,
    jobType: "Full-time",
  },
  {
    fullName: "Lina Osei",
    role: "UI/UX Designer",
    status: "active",
    dateJoined: "2026-04-29",
    shiftsLogged: 14,
    jobType: "Full-time",
  },
  {
    fullName: "Ako James",
    role: "Frontend Developer",
    status: "active",
    dateJoined: "2026-04-26",
    shiftsLogged: 17,
    jobType: "Contract",
  },
  {
    fullName: "Lina Osei",
    role: "UI/UX Designer",
    status: "active",
    dateJoined: "2026-04-24",
    shiftsLogged: 19,
    jobType: "Full-time",
  },
  {
    fullName: "Ako James",
    role: "Backend Negineer",
    status: "terminated",
    dateJoined: "2026-03-12",
    shiftsLogged: 33,
    jobType: "Contract",
  },
  {
    fullName: "Lina Osei",
    role: "UI/UX Designer",
    status: "rejected",
    dateJoined: "2025-12-04",
    shiftsLogged: 126,
    jobType: "Full-time",
  },
];

export function createDemoWorkforce(): EmployerWorkforceListItem[] {
  const core = DEMO_WORKFORCE_CORE.map((worker, i) => ({
    workerId: `demo-worker-hired-${i + 1}`,
    id: `demo-worker-hired-${i + 1}`,
    fullName: worker.fullName,
    name: worker.fullName,
    role: worker.role,
    status: worker.status,
    dateJoined: worker.dateJoined,
    shiftsLogged: worker.shiftsLogged,
    jobType: worker.jobType,
  }));

  return core;
}

export function workforceWorkerToDetail(worker: EmployerWorkforceListItem): EmployerWorkforceListItem & {
  job?: EmployerJobDetail;
  submittedProfile?: EmployerApplicantDetail["submittedProfile"];
} {
  const name = String(worker.fullName ?? worker.name ?? "Worker");
  const isAko = name === "Ako James";
  const job = jobToDetail({
    jobId: `demo-workforce-job-${worker.workerId ?? worker.id}`,
    title: String(worker.role ?? "Role"),
    status: "live",
    jobType: String(worker.jobType ?? "Full-time"),
    location: isAko ? "Buea" : "Douala",
  });

  if (isAko) {
    job.company = "TechCo Cameroun";
    job.pay = 185000;
    job.currency = "XAF";
    job.per = "mo";
    job.schedule = "5d/week";
    job.title = "Frontend Developer";
  }

  return {
    ...worker,
    job,
    submittedProfile: {
      fullName: isAko ? "Ako James" : name,
      headline: isAko ? "Frontend Developer, Marketer" : String(worker.role ?? ""),
      location: isAko ? "Buea, Cameroon" : "Douala, Cameroon",
      phone: "(+237) 652036786",
      languages: "English, French",
      verificationStatus: "VERIFIED",
      summary:
        "Senior frontend developer with 5 years experience in Fintech and SaaS. I build accessible, high-performance interfaces and collaborate closely with product teams.",
      industries: "Design & Creative, Software & Tech, Marketing & Advertising · Full-time, part-time",
      skills: ["React", "Tailwind CSS", "NextJs", "Claude Code", "Figma", "Copywriting", "Advertising", "Leadership"],
      highlightedSkills: ["Copywriting", "Advertising", "Leadership"],
      workHistory: [
        {
          company: "TechoCameroun",
          role: "Frontend Developer",
          description:
            "Developed high-performance SaaS frontends, improved Core Web Vitals, and led UI component standards across three product squads.",
          period: "Jan. 2023 - Aug. 2025 • Buea, Cameroon",
        },
      ],
    },
  };
}

export function createDemoPaymentHistory(): EmployerPaymentHistoryItem[] {
  return Array.from({ length: 35 }, (_, i) => ({
    paymentId: `demo-pay-${i + 1}`,
    id: `demo-pay-${i + 1}`,
    amount: 45000 + i * 5000,
    currency: "XAF",
    status: i % 7 === 0 ? "pending" : "completed",
    workerName: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
    period: `2026-0${(i % 5) + 1}`,
    createdAt: daysAgo(i % 60),
  }));
}

export function buildEmployerDashboard(jobs: EmployerJobListItem[], applicants: EmployerApplicantListItem[]): EmployerDashboard {
  const liveJobs = jobs.filter((j) => j.status === "live");
  return {
    activeJobs: { count: liveJobs.length, trend: "+2 this month" },
    totalApplicants: { count: applicants.length, trend: "+18 this week" },
    hiredWorkers: { count: 24, trend: "3 starting soon" },
    totalPayroll: { count: "2.4M XAF", trend: "+12% vs last month" },
    liveJobs: liveJobs.slice(0, 8),
  };
}

export function applicantFilters(jobs: EmployerJobListItem[]): EmployerApplicantFilters {
  return {
    jobTitles: jobs.map((j) => ({ jobId: j.jobId, title: j.title })),
    statuses: ["pending", "shortlisted", "rejected", "hired"],
  };
}

export function jobToDetail(job: EmployerJobListItem): EmployerJobDetail {
  return {
    ...job,
    company: "joballa Education",
    pay: 45000,
    currency: "XAF",
    per: "mo",
    schedule: "3d/week",
    workMode: "Onsite",
    neighbourhood: "Akwa",
    description:
      "We are looking for a patient and engaging tutor to help two children (ages 8 and 11) with math and science homework. You will create a supportive learning environment and track progress weekly.",
    requirements: [
      "Degree in Education, Science, or Math",
      "At least 1 year tutoring experience",
      "Bilingual (English & French)",
      "Available Mon, Wed, Fri 4PM-6PM",
    ],
    responsibilities: [
      "Prepare short lesson plans aligned with school curriculum",
      "Review homework and explain concepts clearly",
      "Share weekly progress notes with parents",
    ],
    city: job.location,
    requiredSkills: ["Communication", "Teamwork"],
    employmentType: job.jobType,
    durationValue: 9,
    durationUnit: "months",
    startAsap: true,
    numberOfOpenings: 2,
  };
}

export function applicantToDetail(
  app: EmployerApplicantListItem,
  job?: EmployerJobDetail,
): EmployerApplicantDetail {
  const resolvedJob = job ?? (app.jobId ? jobToDetail({ jobId: app.jobId, title: app.jobTitle ?? "", status: "live" }) : undefined);
  return {
    ...app,
    applicationId: app.applicationId ?? app.id,
    job: resolvedJob,
    submittedProfile: {
      fullName: app.applicantName ?? app.name ?? "Ako James",
      headline: "Frontend Developer, Marketer",
      location: app.location ?? "Buea, Cameroon",
      phone: "(+237) 652036786",
      languages: "English, French",
      verificationStatus: "VERIFIED",
      summary:
        "Senior frontend developer with 5 years experience in Fintech and SaaS. I build accessible, high-performance interfaces and collaborate closely with product teams.",
      industries: "Design & Creative, Software & Tech, Marketing & Advertising · Full-time, part-time",
      skills: [
        "React",
        "Tailwind CSS",
        "NextJs",
        "Claude Code",
        "Figma",
        "Copywriting",
        "Advertising",
        "Leadership",
      ],
      highlightedSkills: ["Copywriting", "Advertising", "Leadership"],
      workHistory: [
        {
          company: "TechoCameroun",
          role: "Frontend Developer",
          description:
            "Developed high-performance SaaS frontends, improved Core Web Vitals, and led UI component standards across three product squads.",
          period: "Jan. 2023 - Aug. 2025 • Buea, Cameroon",
        },
        {
          company: "Bafta Technologies",
          role: "Marketing Manager",
          description:
            "Planned and executed multi-channel campaigns that increased qualified leads by 28% in six months.",
          period: "Jan 2022 - Dec 2022 • Limbe, Cameroon",
        },
      ],
      documents: [{ name: "HubSpot Marketing Manager_Ako_James.pdf", type: "PDF" }],
    },
  };
}

const MUSA_SHIFT_NOTES = [
  "Restructuring Sliver code base and improving module boundaries for the payments squad.",
  "Configuring cloud architecture for staging environments and documenting deployment steps.",
  "Pairing with frontend on API contracts and fixing regression tests for auth flows.",
  "Reviewing pull requests and mentoring junior developers on service layer patterns.",
];

export function demoShifts(workerId: string): EmployerShift[] {
  if (workerId === "demo-worker-hired-1") {
    return MUSA_SHIFT_NOTES.map((notes, i) => ({
      shiftId: `shift-${workerId}-${i + 1}`,
      id: `shift-${workerId}-${i + 1}`,
      date: `2026-05-${String(i + 1).padStart(2, "0")}`,
      hours: 8,
      notes,
      loggedBy: "Employer",
    }));
  }

  return Array.from({ length: 8 }, (_, i) => ({
    shiftId: `shift-${workerId}-${i + 1}`,
    id: `shift-${workerId}-${i + 1}`,
    date: daysAgo(i * 3),
    hours: 6 + (i % 3),
    notes: i % 2 === 0 ? "On-site shift" : null,
    loggedBy: "Employer",
  }));
}

export const DEMO_PAYMENTS_SUMMARY: EmployerPaymentsSummary = {
  dueThisPeriod: { count: "485K XAF" },
  pendingApprovals: { count: 3 },
  paidThisMonth: { count: "1.1M XAF" },
  workersAwaitingPay: { count: 8 },
};

export function demoPayWorkers(workforce: EmployerWorkforceListItem[]): EmployerPayWorkersResponse {
  return {
    items: workforce.slice(0, 12).map((w, i) => ({
      workerId: w.workerId ?? w.id,
      id: w.workerId ?? w.id,
      name: w.fullName ?? w.name,
      amountDue: 75000 + i * 12000,
      paid: i % 4 === 0,
      status: i % 4 === 0 ? "paid" : "due",
    })),
  };
}
