import type { JobType } from "@/lib/types/enums";
import type { WorkerFullProfile } from "@/features/worker/types/worker-portal";

export type LandingProfilePreviewMessages = {
  firstName: string;
  lastName: string;
  professionalTitle: string;
  summary: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  languages: string[];
  industries: string[];
  preferredJobTypes: JobType[];
  skills: string[];
  work: {
    jobTitle: string;
    companyName: string;
    description: string;
    city: string;
  };
  education: {
    degree: string;
    institution: string;
    fieldOfStudy: string;
  };
  certification: {
    name: string;
    issuer: string;
  };
  document: {
    fileName: string;
  };
};

export function buildLandingProfilePreview(messages: LandingProfilePreviewMessages): WorkerFullProfile {
  return {
    id: "landing-profile-preview",
    firstName: messages.firstName,
    lastName: messages.lastName,
    professionalTitle: messages.professionalTitle,
    summary: messages.summary,
    city: messages.city,
    region: messages.region,
    country: messages.country,
    languages: messages.languages,
    industries: messages.industries,
    preferredJobTypes: messages.preferredJobTypes,
    skills: messages.skills,
    avatarUrl: "/images/landing/profile-cloud-architect.png",
    verificationStatus: "VERIFIED",
    availableForHire: true,
    availabilityStatus: "AVAILABLE",
    kycSubmissions: [{ id: "landing-kyc", status: "VERIFIED" }],
    workHistories: [
      {
        id: "landing-work-1",
        jobTitle: messages.work.jobTitle,
        companyName: messages.work.companyName,
        description: messages.work.description,
        startDate: "2021-03-01",
        endDate: null,
        isCurrent: true,
        city: messages.work.city,
      },
    ],
    educations: [
      {
        id: "landing-edu-1",
        degree: messages.education.degree,
        institution: messages.education.institution,
        fieldOfStudy: messages.education.fieldOfStudy,
        startDate: "2014-09-01",
        endDate: "2018-06-01",
      },
    ],
    certifications: [
      {
        id: "landing-cert-1",
        name: messages.certification.name,
        issuer: messages.certification.issuer,
        issueDate: "2023-01-01",
      },
    ],
    documents: [
      {
        id: "landing-doc-1",
        type: "CV",
        fileName: messages.document.fileName,
      },
    ],
    paymentMethods: [
      {
        id: "landing-pay-1",
        provider: "MTN_MOMO",
        phone: messages.phone,
        phoneNumber: messages.phone,
        isPrimary: true,
      },
    ],
  };
}
