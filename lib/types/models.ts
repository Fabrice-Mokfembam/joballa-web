import type {
  ApplicationStatus,
  AvailabilityStatus,
  DepartmentCategory,
  DisputeStatus,
  EngagementStatus,
  FlagType,
  JobStatus,
  JobType,
  Language,
  MomoProvider,
  NotificationChannel,
  NotificationType,
  OtpPurpose,
  PayStructure,
  PaymentStatus,
  Role,
  VerificationStatus,
} from "./enums";
import type { EducationEntry, WorkHistoryEntry } from "./json-shapes";

/** `Decimal` fields as returned in typical JSON APIs (string preserves precision). */
export type DecimalString = string;

export type User = {
  id: string;
  email: string | null;
  phone: string | null;
  /** Usually omitted in API responses. */
  passwordHash?: string | null;
  role: Role;
  languagePreference: Language;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OtpCode = {
  id: string;
  identifier: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  registrationSnapshot: unknown | null;
};

export type RefreshToken = {
  id: string;
  userId: string;
  lookupDigest: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};

export type WorkerProfile = {
  id: string;
  userId: string;
  fullName: string;
  city: string | null;
  region: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  preferredJobCategories: string[];
  languagesSpoken: string[];
  availabilityStatus: AvailabilityStatus;
  skills: string[];
  workHistory: WorkHistoryEntry[];
  education: EducationEntry[];
  nationalIdDocUrl: string | null;
  verificationStatus: VerificationStatus;
  verificationNotes: string | null;
  uploadedResumeUrl: string | null;
  profileCompleteness: number;
  mobileMoneyProvider: MomoProvider | null;
  mobileMoneyNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployerProfile = {
  id: string;
  userId: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  logoUrl: string | null;
  website: string | null;
  about: string | null;
  isJoballaDepartment: boolean;
  departmentCategory: DepartmentCategory | null;
  businessRegDocUrl: string | null;
  verificationStatus: VerificationStatus;
  verificationNotes: string | null;
  paymentProvider: MomoProvider | null;
  paymentAccount: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: string;
  employerId: string;
  title: string;
  description: string;
  category: string;
  jobType: JobType;
  location: string;
  payRate: DecimalString;
  payStructure: PayStructure;
  startDate: string | null;
  endDate: string | null;
  numberOfOpenings: number;
  requiredSkills: string[];
  requestedDocuments: string[];
  status: JobStatus;
  adminNotes: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Application = {
  id: string;
  jobId: string;
  workerId: string;
  submittedAt: string;
  profileSnapshot: Record<string, unknown>;
  jobSpecificNote: string | null;
  attachedDocuments: string[];
  status: ApplicationStatus;
  employerNotes: string | null;
  updatedAt: string;
};

export type WorkEngagement = {
  id: string;
  jobId: string;
  workerId: string;
  employerId: string;
  applicationId: string | null;
  startDate: string;
  endDate: string | null;
  agreedRate: DecimalString;
  payStructure: PayStructure;
  status: EngagementStatus;
  taskNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShiftLog = {
  id: string;
  engagementId: string;
  date: string;
  hoursWorked: DecimalString;
  notes: string | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  engagementId: string;
  workerId: string;
  employerId: string;
  amount: DecimalString;
  currency: string;
  mobileMoneyProvider: MomoProvider;
  recipientNumber: string;
  fapshiTransactionId: string | null;
  fapshiReference: string | null;
  idempotencyKey: string;
  status: PaymentStatus;
  failureReason: string | null;
  initiatedAt: string;
  confirmedAt: string | null;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  message: string;
  metadata: unknown | null;
  read: boolean;
  sentAt: string;
};

export type AIRecommendation = {
  id: string;
  workerId: string;
  jobId: string;
  relevanceScore: number;
  matchedSkills: string[];
  reasoning: string | null;
  generatedAt: string;
  expiresAt: string;
};

export type FraudFlag = {
  id: string;
  targetUserId: string;
  flaggedById: string | null;
  flagType: FlagType;
  reason: string;
  evidence: unknown | null;
  resolved: boolean;
  resolvedNotes: string | null;
  flaggedAt: string;
  resolvedAt: string | null;
};

export type Dispute = {
  id: string;
  raisedByUserId: string;
  againstUserId: string;
  engagementId: string | null;
  subject: string;
  description: string;
  evidence: unknown | null;
  status: DisputeStatus;
  adminNotes: string | null;
  resolvedBy: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type AdminAction = {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  notes: string | null;
  metadata: unknown | null;
  performedAt: string;
};

export type SessionLog = {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  action: string;
  createdAt: string;
};
