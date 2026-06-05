/**
 * Mirrors `schema.prisma` enums (Joballa / PostgreSQL).
 * API payloads typically use these string values over the wire.
 */

export type Role = "WORKER" | "EMPLOYER" | "ADMIN" | "SUPER_ADMIN";

export type Language = "EN" | "FR" | "eng" | "fre";

export type VerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "MORE_INFO_REQUIRED";

export type AvailabilityStatus = "AVAILABLE" | "OPEN_TO_OFFERS" | "NOT_AVAILABLE";

export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "CASUAL"
  | "SEASONAL"
  | "INTERNSHIP";

export type PayStructure = "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "FIXED";

export type JobStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "REJECTED";

export type ApplicationStatus =
  | "SUBMITTED"
  | "SHORTLISTED"
  | "HIRED"
  | "REJECTED";

export type EngagementStatus = "ACTIVE" | "COMPLETED" | "TERMINATED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type MomoProvider = "MTN_MOMO" | "ORANGE_MONEY";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS";

/** v2 auth API values (lowercase). */
export type OtpPurpose = "registration" | "password_reset";

export type NotificationType =
  | "ACCOUNT_CREATED"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "APPLICATION_RECEIVED"
  | "APPLICATION_SHORTLISTED"
  | "APPLICATION_HIRED"
  | "APPLICATION_REJECTED"
  | "JOB_APPROVED"
  | "JOB_REJECTED"
  | "PAYMENT_SENT"
  | "PAYMENT_RECEIVED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "HIRE_CONFIRMED"
  | "OTP"
  | "SECURITY_ALERT";

export type DepartmentCategory =
  | "EDUCATION"
  | "DOMESTIC"
  | "LOGISTICS"
  | "EVENTS"
  | "AGRICULTURE"
  | "CONSTRUCTION";

export type FlagType =
  | "DUPLICATE_PROFILE"
  | "SUSPICIOUS_ACTIVITY"
  | "FRAUDULENT_JOB"
  | "FAKE_DOCUMENTS"
  | "PAYMENT_FRAUD";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
