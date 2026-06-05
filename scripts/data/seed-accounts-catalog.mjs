/** Profiles and job templates for `scripts/seed-accounts.mjs` */

export const TECH_CHANTIER_LOGO_URL =
  "https://media.licdn.com/dms/image/v2/D4E0BAQFWZBaG1aJj7A/company-logo_200_200/company-logo_200_200/0/1700897502060/techchantier_logo?e=2147483647&v=beta&t=TxQLnpYvxQRtveAQ9Fd-H996jBbgJO2xL0FwXJgYEco";

export const TECH_CHANTIER_COMPANY = {
  name: "Tech Chantier",
  industry: "Technology",
  size: "11-50",
  website: "https://techchantier.com",
  bio: "Tech Chantier delivers IT training, software development, and digital transformation for teams across Cameroon.",
  logo: TECH_CHANTIER_LOGO_URL,
  location: { city: "Yaoundé", country: "Cameroon" },
};

export const TECH_CHANTIER_IT_JOBS = [
  { title: "Full-Stack Developer", employmentType: "Full Time", pay: 350000, skills: ["TypeScript", "React", "Node.js"] },
  { title: "Frontend Engineer", employmentType: "Full Time", pay: 280000, skills: ["React", "Next.js", "CSS"] },
  { title: "Backend Developer (NestJS)", employmentType: "Full Time", pay: 320000, skills: ["NestJS", "PostgreSQL", "REST"] },
  { title: "DevOps Engineer", employmentType: "Contract", pay: 300000, skills: ["Docker", "CI/CD", "Linux"] },
  { title: "UI/UX Designer", employmentType: "Full Time", pay: 240000, skills: ["Figma", "Prototyping", "Design systems"] },
  { title: "QA Engineer", employmentType: "Full Time", pay: 210000, skills: ["Jest", "Cypress", "Test plans"] },
  { title: "Mobile Developer (React Native)", employmentType: "Contract", pay: 290000, skills: ["React Native", "iOS", "Android"] },
  { title: "Data Analyst", employmentType: "Full Time", pay: 260000, skills: ["SQL", "Excel", "Power BI"] },
  { title: "Cybersecurity Analyst", employmentType: "Contract", pay: 310000, skills: ["Security audits", "Networking", "SIEM"] },
  { title: "IT Support Specialist", employmentType: "Full Time", pay: 165000, skills: ["Help desk", "Windows", "Networking"] },
  { title: "Cloud Engineer", employmentType: "Full Time", pay: 340000, skills: ["AWS", "Terraform", "Kubernetes"] },
  { title: "Technical Writer", employmentType: "Part Time", pay: 140000, skills: ["Documentation", "API docs", "English"] },
];

/** Teaching-focused postings (seeded by Tech Chantier education division until worker job-post API exists). */
export const TEACHING_JOB_TEMPLATES = [
  { title: "Mathematics Home Tutor", employmentType: "Part Time", pay: 65000, skills: ["Mathematics", "Teaching", "French"] },
  { title: "English Language Tutor", employmentType: "Part Time", pay: 60000, skills: ["English", "Teaching", "Communication"] },
  { title: "Physics Teacher — Secondary", employmentType: "Full Time", pay: 185000, skills: ["Physics", "Curriculum", "French"] },
  { title: "French Literature Instructor", employmentType: "Contract", pay: 120000, skills: ["French", "Literature", "Teaching"] },
  { title: "Computer Science Instructor", employmentType: "Full Time", pay: 220000, skills: ["Programming", "Teaching", "Python"] },
  { title: "Early Childhood Educator", employmentType: "Full Time", pay: 95000, skills: ["Childcare", "Education", "Patience"] },
  { title: "Exam Prep Coach (GCE/A-Level)", employmentType: "Part Time", pay: 75000, skills: ["Exam prep", "Coaching", "Math"] },
  { title: "Coding Bootcamp Mentor", employmentType: "Contract", pay: 150000, skills: ["JavaScript", "Teaching", "Mentoring"] },
  { title: "Special Needs Learning Assistant", employmentType: "Part Time", pay: 80000, skills: ["Special education", "Patience", "French"] },
  { title: "Science Lab Assistant", employmentType: "Part Time", pay: 70000, skills: ["Biology", "Chemistry", "Lab safety"] },
];

/** Takem Family Health — employer health organization */
export const HEALTH_ORG_COMPANY = {
  name: "Takem Family Health",
  industry: "Healthcare",
  size: "51-200",
  website: "https://takemfamilyhealth.org",
  bio: "Takem Family Health provides community clinics, home care, nursing support, and public health outreach across Cameroon.",
  location: { city: "Douala", country: "Cameroon" },
};

export const HEALTH_ORG_JOBS = [
  { title: "Registered Nurse", employmentType: "Full Time", pay: 195000, skills: ["Nursing", "Patient care", "French"] },
  { title: "Community Health Worker", employmentType: "Full Time", pay: 125000, skills: ["Outreach", "Health education", "French"] },
  { title: "Medical Laboratory Technician", employmentType: "Full Time", pay: 165000, skills: ["Lab tests", "Sample handling", "Safety"] },
  { title: "Pharmacy Assistant", employmentType: "Full Time", pay: 140000, skills: ["Pharmacy", "Inventory", "Customer service"] },
  { title: "Home Care Nurse", employmentType: "Part Time", pay: 110000, skills: ["Home visits", "Elder care", "First aid"] },
  { title: "Midwife", employmentType: "Full Time", pay: 210000, skills: ["Maternal health", "Delivery support", "French"] },
  { title: "Physiotherapy Aide", employmentType: "Contract", pay: 130000, skills: ["Rehabilitation", "Mobility", "Patient support"] },
  { title: "Dental Clinic Assistant", employmentType: "Full Time", pay: 118000, skills: ["Dental hygiene", "Sterilization", "Scheduling"] },
  { title: "Mental Health Counselor", employmentType: "Contract", pay: 175000, skills: ["Counseling", "Active listening", "English"] },
  { title: "Nutritionist", employmentType: "Part Time", pay: 145000, skills: ["Nutrition", "Diet planning", "Community workshops"] },
  { title: "Emergency Care Technician", employmentType: "Full Time", pay: 185000, skills: ["First aid", "Triage", "Ambulance support"] },
  { title: "Health Records Officer", employmentType: "Full Time", pay: 135000, skills: ["Medical records", "Data entry", "Privacy"] },
  { title: "Vaccination Campaign Coordinator", employmentType: "Contract", pay: 155000, skills: ["Public health", "Logistics", "French"] },
  { title: "Pediatric Care Assistant", employmentType: "Full Time", pay: 128000, skills: ["Childcare", "Vitals", "Patience"] },
];

export const TEACHING_WORKER_PROFILE = {
  personal: {
    firstName: "Tjan",
    lastName: "Anonymous",
    city: "Buea",
    region: "South-West",
    country: "Cameroon",
    languages: ["English", "French"],
    availabilityStatus: "AVAILABLE",
  },
  summary: {
    title: "Educator & Private Tutor",
    summary:
      "Experienced tutor for secondary and university students. Specializes in STEM subjects, exam preparation, and bilingual instruction in English and French.",
    industries: ["Education", "Technology", "Domestic"],
    preferredJobTypes: ["PART_TIME", "CONTRACT", "CASUAL"],
  },
  skills: {
    skills: [
      "Mathematics",
      "Physics",
      "English",
      "French",
      "Lesson planning",
      "Exam preparation",
      "Classroom management",
      "Online tutoring",
    ],
  },
  payment: {
    mobileMoneyProvider: "MTN_MOMO",
    mobileMoneyNumber: "+237677009876",
  },
  workHistory: {
    role: "Private Tutor",
    company: "Independent",
    startDate: "2021-09-01",
    description: "One-on-one and small-group tutoring for GCE and university entrance exams.",
  },
};
