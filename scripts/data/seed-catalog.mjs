/** Shared payloads for `scripts/seed-demo.mjs` */

export const CITIES = ["Yaoundé", "Douala", "Buea", "Limbe", "Bamenda", "Kribi"];
export const NEIGHBOURHOODS = ["Centre", "Bonanjo", "Molyko", "Down Beach", "Commercial Ave"];

export const JOB_TEMPLATES = [
  { title: "Admin Assistant", employmentType: "Full Time", pay: 95000, skills: ["Excel", "Scheduling"] },
  { title: "Marketing Specialist", employmentType: "Full Time", pay: 145000, skills: ["Canva", "Social media"] },
  { title: "Graphic Designer", employmentType: "Contract", pay: 85000, skills: ["Figma", "Illustrator"] },
  { title: "Home Tutor — Math & English", employmentType: "Part Time", pay: 55000, skills: ["Teaching", "English"] },
  { title: "Software Engineer", employmentType: "Full Time", pay: 320000, skills: ["TypeScript", "React"] },
  { title: "Logistics Coordinator", employmentType: "Full Time", pay: 110000, skills: ["Inventory", "GPS"] },
  { title: "Field Sales Representative", employmentType: "Full Time", pay: 125000, skills: ["Sales", "MoMo"] },
  { title: "Customer Support Agent", employmentType: "Full Time", pay: 88000, skills: ["CRM", "French"] },
  { title: "Warehouse Supervisor", employmentType: "Full Time", pay: 102000, skills: ["Forklift", "Safety"] },
  { title: "Social Media Manager", employmentType: "Part Time", pay: 72000, skills: ["TikTok", "Content"] },
  { title: "Electrician", employmentType: "Contract", pay: 98000, skills: ["Wiring", "Maintenance"] },
  { title: "Nurse Assistant", employmentType: "Full Time", pay: 115000, skills: ["First aid", "Care"] },
  { title: "Data Entry Clerk", employmentType: "Part Time", pay: 65000, skills: ["Typing", "Excel"] },
  { title: "Delivery Rider", employmentType: "Full Time", pay: 78000, skills: ["Driving", "Maps"] },
  { title: "Content Writer", employmentType: "Contract", pay: 92000, skills: ["SEO", "Copywriting"] },
  { title: "Event Host", employmentType: "Part Time", pay: 68000, skills: ["Public speaking", "Events"] },
  { title: "Farm Supervisor", employmentType: "Contract", pay: 105000, skills: ["Agriculture", "Teams"] },
  { title: "Security Guard", employmentType: "Full Time", pay: 75000, skills: ["Patrol", "Reports"] },
  { title: "HR Coordinator", employmentType: "Full Time", pay: 135000, skills: ["Recruitment", "HRIS"] },
  { title: "Video Editor", employmentType: "Contract", pay: 118000, skills: ["Premiere", "Motion"] },
  { title: "Call Center Agent", employmentType: "Full Time", pay: 82000, skills: ["Phone", "Support"] },
  { title: "Inventory Auditor", employmentType: "Contract", pay: 94000, skills: ["Audit", "Excel"] },
  { title: "Teaching Assistant", employmentType: "Part Time", pay: 58000, skills: ["Education", "French"] },
  { title: "Receptionist", employmentType: "Full Time", pay: 70000, skills: ["Front desk", "English"] },
  { title: "Accounting Intern", employmentType: "Internship", pay: 45000, skills: ["QuickBooks", "Math"] },
];

export function buildEmployerJobBody(template, index) {
  const city = CITIES[index % CITIES.length];
  const neighbourhood = NEIGHBOURHOODS[index % NEIGHBOURHOODS.length];
  return {
    title: `${template.title} (${city})`,
    city,
    neighbourhood,
    description: `Demo seed role #${index + 1}: ${template.title} in ${city}. Clear weekly goals, reporting lines, and professional workplace standards.`,
    requiredSkills: template.skills,
    requiredLevel: index % 3 === 0 ? "Senior" : index % 3 === 1 ? "Mid" : "Junior",
    employmentType: template.employmentType,
    durationValue: 6 + (index % 6),
    durationUnit: "Months",
    pay: template.pay,
    currency: "XAF",
    per: "Month",
    numberOfOpenings: 1 + (index % 3),
    startAsap: index % 4 === 0,
    startDate: index % 4 === 0 ? undefined : "2026-06-01",
    requirements: [
      "Relevant experience or strong transferable skills",
      "Reliable attendance and professional communication",
      "Comfort working in English and French",
    ],
    responsibilities: [
      "Deliver tasks described in the role brief with clear updates",
      "Coordinate with the hiring manager on timing and location",
      "Maintain agreed quality and safety standards",
    ],
    asDraft: false,
  };
}

export const WORKER_PROFILE_PATCHES = {
  personal: {
    firstName: "Ako",
    lastName: "James Ngu",
    city: "Yaoundé",
    region: "Centre",
    country: "Cameroon",
    languages: ["English", "French"],
    availabilityStatus: "AVAILABLE",
  },
  summary: {
    title: "Marketing & Operations Specialist",
    summary:
      "Five years coordinating campaigns, client onboarding, and field teams across Centre and Littoral. Comfortable with MoMo payroll flows and bilingual stakeholder communication.",
    industries: ["Marketing", "Education", "Logistics"],
    preferredJobTypes: ["FULL_TIME", "PART_TIME", "CONTRACT"],
  },
  skills: {
    skills: [
      "Excel",
      "Canva",
      "Customer support",
      "Social media",
      "Sales",
      "French",
      "English",
      "Field coordination",
    ],
  },
  payment: {
    mobileMoneyProvider: "MTN_MOMO",
    mobileMoneyNumber: "+237677001234",
  },
  workHistory: {
    role: "Marketing Coordinator",
    company: "Joballa Education",
    startDate: "2022-03-01",
    description: "Owned social campaigns and partner outreach for training programs.",
  },
};
