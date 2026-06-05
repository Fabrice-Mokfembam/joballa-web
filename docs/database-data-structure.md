# Joballa Backend Database Data Structure

Source of truth: `prisma/schema.prisma`

This document explains how data is stored in the Joballa backend database. The backend uses Prisma with PostgreSQL, so each Prisma model maps to a database table through `@@map(...)`. The examples below describe the shape of the data stored in each row, not a dump of live production data.

## Storage Overview

- Database: PostgreSQL
- ORM: Prisma
- Main schema file: `prisma/schema.prisma`
- Migration history: `prisma/migrations/`
- Main ID style: UUID strings for most business tables, CUID strings for OTP and refresh token tables
- Array fields: PostgreSQL arrays, mostly `String[]` or enum arrays
- JSON fields: PostgreSQL JSON/JSONB through Prisma `Json`
- Decimal money fields: PostgreSQL decimals, usually `Decimal(12, 2)`
- File fields: stored as URLs, usually Cloudinary URLs, not binary blobs in the database

## Core Data Flow

1. A `users` row stores login/account identity.
2. A user has either a `worker_profiles` row, an `employer_profiles` row, or an admin role without a profile.
3. Employers create `jobs`.
4. Workers save, hide, report, customize, and apply to jobs.
5. Each application stores a JSON snapshot of the worker profile at submission time.
6. A hired application can become a `work_engagements` row.
7. Engagements can have `shift_logs` and `payments`.
8. Admin and platform activity is stored through review notes, audit logs, flags, disputes, settings, sessions, and notifications.

## Enums

Enums restrict a field to known values.

| Enum | Values |
| --- | --- |
| `Role` | `WORKER`, `EMPLOYER`, `ADMIN`, `SUPER_ADMIN` |
| `Language` | `EN`, `FR` |
| `VerificationStatus` | `PENDING`, `VERIFIED`, `REJECTED`, `MORE_INFO_REQUIRED` |
| `AvailabilityStatus` | `AVAILABLE`, `OPEN_TO_OFFERS`, `NOT_AVAILABLE` |
| `JobType` | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `CASUAL`, `SEASONAL`, `INTERNSHIP` |
| `WorkMode` | `ON_SITE`, `REMOTE`, `HYBRID` |
| `PayStructure` | `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, `FIXED` |
| `JobStatus` | `DRAFT`, `UNDER_REVIEW`, `ACTIVE`, `PAUSED`, `CLOSED`, `REJECTED` |
| `ApplicationStatus` | `SUBMITTED`, `SHORTLISTED`, `HIRED`, `REJECTED` |
| `EngagementStatus` | `ACTIVE`, `COMPLETED`, `TERMINATED` |
| `PaymentStatus` | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `MomoProvider` | `MTN_MOMO`, `ORANGE_MONEY` |
| `NotificationChannel` | `IN_APP`, `EMAIL`, `SMS` |
| `OtpPurpose` | `REGISTRATION`, `PASSWORD_RESET` |
| `NotificationType` | `ACCOUNT_CREATED`, `VERIFICATION_APPROVED`, `VERIFICATION_REJECTED`, `APPLICATION_RECEIVED`, `APPLICATION_SHORTLISTED`, `APPLICATION_HIRED`, `APPLICATION_REJECTED`, `JOB_APPROVED`, `JOB_REJECTED`, `PAYMENT_SENT`, `PAYMENT_RECEIVED`, `DISPUTE_OPENED`, `DISPUTE_RESOLVED`, `HIRE_CONFIRMED`, `OTP`, `SECURITY_ALERT` |
| `DepartmentCategory` | `EDUCATION`, `TECH`, `DOMESTIC`, `LOGISTICS`, `EVENTS`, `AGRICULTURE`, `CONSTRUCTION` |
| `DocumentReviewStatus` | `PENDING`, `APPROVED`, `REJECTED`, `RESUBMISSION_REQUESTED`, `EXPIRED` |
| `DocumentRiskLevel` | `LOW`, `MEDIUM`, `HIGH` |
| `FlagType` | `DUPLICATE_PROFILE`, `SUSPICIOUS_ACTIVITY`, `FRAUDULENT_JOB`, `FAKE_DOCUMENTS`, `PAYMENT_FRAUD` |
| `DisputeStatus` | `OPEN`, `UNDER_REVIEW`, `WAITING_FOR_USER`, `ESCALATED`, `RESOLVED`, `CLOSED` |
| `DocumentType` | `CV`, `CERTIFICATE`, `PORTFOLIO`, `OTHER` |
| `KYCDocumentType` | `NATIONAL_ID`, `PASSPORT`, `DRIVERS_LICENSE` |
| `JobCreatedByType` | `EMPLOYER`, `WORKER` |
| `JobReportReason` | `FAKE_JOB`, `MISLEADING_DESCRIPTION`, `INAPPROPRIATE_CONTENT`, `SCAM`, `DUPLICATE`, `OTHER` |

## Tables

### `users`

Stores the base account for every worker, employer, admin, and super admin.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `email` | `String?` | Unique, optional in schema |
| `phone` | `String?` | Unique, optional |
| `passwordHash` | `String?` | Hashed password, never raw password |
| `role` | `Role` | User role |
| `languagePreference` | `Language` | Default `EN` |
| `verificationStatus` | `VerificationStatus` | Default `PENDING` |
| `isActive` | `Boolean` | Default `true` |
| `assignedDepartmentId` | `String?` | Department-scoped admin target, stores `employer_profiles.id` |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Relations: one user can have refresh tokens, notifications, fraud flags, admin actions, review notes, session logs, and either one worker profile or one employer profile.

### `otp_codes`

Stores hashed OTP codes for registration and password reset.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, CUID |
| `identifier` | `String` | Email or phone used for OTP |
| `code_hash` | `String` | Hashed OTP code |
| `purpose` | `OtpPurpose` | Registration or password reset |
| `expires_at` | `DateTime` | Expiration timestamp |
| `used` | `Boolean` | Default `false` |
| `created_at` | `DateTime` | Created timestamp |
| `registration_snapshot` | `Json?` | Temporary registration details captured before account creation |

Indexes: `identifier + purpose`.

### `refresh_tokens`

Stores refresh token lookup and validation data.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, CUID |
| `user_id` | `String` | Foreign key to `users.id`, cascade delete |
| `lookup_digest` | `String` | Unique digest used to find token |
| `token_hash` | `String` | Hash used to validate token |
| `expires_at` | `DateTime` | Expiration timestamp |
| `created_at` | `DateTime` | Created timestamp |

Indexes: `user_id`, `expires_at`.

### `worker_profiles`

Stores worker identity, public profile, preferences, verification, and payment details.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `userId` | `String` | Unique foreign key to `users.id`, cascade delete |
| `fullName` | `String` | Worker display name |
| `firstName` | `String?` | Optional first name |
| `lastName` | `String?` | Optional last name |
| `avatarUrl` | `String?` | Worker profile image URL |
| `city` | `String?` | City |
| `region` | `String?` | Region |
| `country` | `String?` | Default `Cameroon` |
| `dateOfBirth` | `DateTime?` | Date of birth |
| `languagesSpoken` | `String[]` | Spoken languages |
| `professionalTitle` | `String?` | Profile title |
| `bio` | `Text?` | Longer profile bio |
| `industries` | `String[]` | Default empty array |
| `preferredJobCategories` | `String[]` | Preferred categories |
| `preferredJobTypes` | `JobType[]` | Default empty array |
| `availabilityStatus` | `AvailabilityStatus` | Default `AVAILABLE` |
| `skills` | `String[]` | Worker skills |
| `nationalIdDocUrl` | `String?` | Legacy/single ID document URL |
| `verificationStatus` | `VerificationStatus` | Default `PENDING` |
| `verificationNotes` | `Text?` | Verification notes |
| `uploadedResumeUrl` | `String?` | Legacy/single resume URL |
| `profileCompleteness` | `Int` | Default `0` |
| `profileStrengthBreakdown` | `Json?` | Optional stored checklist used by worker profile strength UI |
| `profileViews` | `Int` | Optional/default `0`, or replace with analytics table if view history is needed |
| `mobileMoneyProvider` | `MomoProvider?` | Payment provider |
| `mobileMoneyNumber` | `String?` | Worker payout number |
| `bankName` | `String?` | Optional bank name |
| `bankAccountNumber` | `String?` | Optional bank account number |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Relations: applications, engagements, payments, recommendations, saved jobs, hidden jobs, work histories, education, certifications, documents, KYC submissions, custom applications, and job reports.

### `worker_payment_accounts`

Stores one or more payout accounts for a worker. This replaces the single legacy `mobileMoneyProvider` / `mobileMoneyNumber` fields for new worker UI.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `provider` | `MomoProvider` | MTN MoMo, Orange Money, etc. |
| `phone` | `String` | Payout phone number |
| `isPrimary` | `Boolean` | Default `false`; only one primary per worker |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`. Recommended unique: `workerId + provider + phone`.

### `work_histories`

Stores one work experience item per row for a worker.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `company` | `String` | Company or client |
| `role` | `String` | Job title or role |
| `website` | `String?` | Company, portfolio, or Joballa profile URL |
| `location` | `String?` | Location |
| `city` | `String?` | City |
| `region` | `String?` | Region |
| `description` | `Text?` | Work description |
| `startDate` | `DateTime` | Start date |
| `endDate` | `DateTime?` | End date |
| `startMonth` | `String?` | Display month from profile form |
| `startYear` | `Int?` | Display year from profile form |
| `endMonth` | `String?` | Display month from profile form |
| `endYear` | `Int?` | Display year from profile form |
| `isCurrent` | `Boolean` | Default `false` |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`.

### `educations`

Stores one education item per row for a worker.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `school` | `String` | School name |
| `website` | `String?` | Institution website |
| `degree` | `String?` | Degree |
| `fieldOfStudy` | `String?` | Field of study |
| `city` | `String?` | City |
| `region` | `String?` | Region |
| `description` | `Text?` | Education notes/coursework |
| `startDate` | `DateTime` | Start date |
| `endDate` | `DateTime?` | End date |
| `startMonth` | `String?` | Display month from profile form |
| `startYear` | `Int?` | Display year from profile form |
| `endMonth` | `String?` | Display month from profile form |
| `endYear` | `Int?` | Display year from profile form |
| `isCurrent` | `Boolean` | Default `false` |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`.

### `certifications`

Stores one professional certificate per row for a worker.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `name` | `String` | Certification name |
| `issuer` | `String?` | Issuing organization |
| `description` | `Text?` | Certificate notes |
| `credentialUrl` | `String?` | External credential URL |
| `documentId` | `String?` | Optional link to `worker_documents.id` |
| `issueDate` | `DateTime?` | Issue date |
| `expiryDate` | `DateTime?` | Expiration date |
| `fileUrl` | `String?` | Uploaded certificate file URL |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`.

### `worker_documents`

Stores uploaded worker documents such as CVs, certificates, and portfolios. The edit-profile CV banner uploads with `type = CV`; supporting uploads may use `CERTIFICATE`, `PORTFOLIO`, or `OTHER`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `type` | `DocumentType` | CV, certificate, portfolio, or other |
| `fileName` | `String` | Original/display file name |
| `fileUrl` | `String` | Uploaded file URL |
| `fileSize` | `Int?` | Size in bytes |
| `mimeType` | `String?` | File MIME type |
| `reviewStatus` | `DocumentReviewStatus` | Default `PENDING` |
| `riskLevel` | `DocumentRiskLevel` | Default `LOW` |
| `rejectionReason` | `Text?` | Rejection message |
| `departmentCategory` | `DepartmentCategory?` | Related department/category |
| `reviewedAt` | `DateTime?` | Review timestamp |
| `reviewedById` | `String?` | Reviewer ID |
| `uploadedAt` | `DateTime` | Upload timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`, `reviewStatus`.

### `kyc_submissions`

Stores KYC ID document submissions for workers.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `documentType` | `KYCDocumentType` | National ID, passport, or driver license |
| `frontImageUrl` | `String` | Front image URL |
| `backImageUrl` | `String?` | Back image URL when applicable |
| `selfieImageUrl` | `String?` | Selfie/liveness image URL |
| `status` | `VerificationStatus` | Default `PENDING` |
| `rejectionReason` | `Text?` | Rejection message |
| `submittedAt` | `DateTime` | Submission timestamp |
| `reviewedAt` | `DateTime?` | Review timestamp |
| `reviewedById` | `String?` | Reviewer ID |
| `reviewNotes` | `Text?` | Admin review notes |

Indexes: `workerId`, `status`.

### `employer_profiles`

Stores employer company profiles and Joballa department profiles.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `userId` | `String` | Unique foreign key to `users.id`, cascade delete |
| `companyName` | `String` | Company or department name |
| `industry` | `String?` | Industry |
| `companySize` | `String?` | Company size |
| `location` | `String?` | Location |
| `logoUrl` | `String?` | Logo URL |
| `website` | `String?` | Website URL |
| `tagline` | `String?` | Short one-line company bio shown under name on public profile |
| `about` | `Text?` | Full “About the company” paragraph |
| `isJoballaDepartment` | `Boolean` | Default `false` |
| `departmentCategory` | `DepartmentCategory?` | Department category |
| `businessRegDocUrl` | `String?` | Business registration document URL |
| `verificationStatus` | `VerificationStatus` | Default `PENDING` |
| `verificationNotes` | `Text?` | Verification notes |
| `paymentProvider` | `MomoProvider?` | Employer payment provider |
| `paymentAccount` | `String?` | Employer payment account |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Relations: jobs, engagements, payments, and approved jobs.

### `jobs`

Stores job postings created by employers.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `employerId` | `String` | Foreign key to `employer_profiles.id`, cascade delete |
| `createdByWorkerId` | `String?` | Optional foreign key to `worker_profiles.id` for worker-created jobs |
| `createdByType` | `String` | `EMPLOYER` or `WORKER`; exactly one owner should be set |
| `title` | `String` | Job title |
| `description` | `Text` | Job description |
| `category` | `String` | Job category |
| `jobType` | `JobType` | Job type |
| `workMode` | `WorkMode` | Default `ON_SITE` |
| `location` | `String` | Main location |
| `city` | `String?` | City |
| `region` | `String?` | Region |
| `neighbourhood` | `String?` | Neighbourhood |
| `payRate` | `Decimal(12,2)` | Pay amount |
| `payStructure` | `PayStructure` | Hourly, daily, monthly, fixed, etc. |
| `currency` | `String` | Default `XAF` |
| `startDate` | `DateTime?` | Start date |
| `endDate` | `DateTime?` | End date |
| `startAsap` | `Boolean` | Default `false` |
| `durationValue` | `Int?` | Duration number |
| `durationUnit` | `String?` | Duration unit |
| `numberOfOpenings` | `Int` | Default `1` |
| `requiredSkills` | `String[]` | Required skills |
| `requiredLevel` | `String?` | Required experience/level |
| `requirements` | `String[]` | Default empty array |
| `responsibilities` | `String[]` | Default empty array |
| `requestedDocuments` | `String[]` | Documents requested from applicants |
| `status` | `JobStatus` | Default `DRAFT` |
| `adminNotes` | `Text?` | Admin review notes |
| `approvedById` | `String?` | Foreign key to `employer_profiles.id` for approver |
| `approvedAt` | `DateTime?` | Approval timestamp |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `status`, `employerId`, `category`, `city`.

### `saved_jobs`

Stores jobs saved/bookmarked by workers.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `jobId` | `String` | Foreign key to `jobs.id`, cascade delete |
| `savedAt` | `DateTime` | Save timestamp |

Constraints: unique `workerId + jobId`. Indexes: `workerId`.

### `hidden_jobs`

Stores jobs hidden by workers from their job results.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `jobId` | `String` | Foreign key to `jobs.id`, cascade delete |
| `hiddenAt` | `DateTime` | Hide timestamp |

Constraints: unique `workerId + jobId`. Indexes: `workerId`.

### `job_reports`

Stores reports submitted by workers against suspicious or inappropriate jobs.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `jobId` | `String` | Foreign key to `jobs.id`, cascade delete |
| `reason` | `JobReportReason` | Report reason |
| `description` | `Text?` | Optional details |
| `createdAt` | `DateTime` | Created timestamp |

Indexes: `jobId`, `workerId`.

### `application_customizations`

Stores a worker's job-specific application draft before final submission.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `jobId` | `String` | Foreign key to `jobs.id`, cascade delete |
| `professionalSummary` | `Text?` | Job-specific summary |
| `skills` | `String[]` | Job-specific selected skills |
| `workHistoryIds` | `String[]` | Selected `work_histories.id` values |
| `createdAt` | `DateTime` | Created timestamp |
| `expiresAt` | `DateTime` | Draft expiration timestamp |

Constraints: unique `workerId + jobId`. Indexes: `workerId`.

### `applications`

Stores one worker application to one job.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `jobId` | `String` | Foreign key to `jobs.id`, cascade delete |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `submittedAt` | `DateTime` | Submission timestamp |
| `profileSnapshot` | `Json` | Worker profile copy at submission time |
| `jobSpecificNote` | `Text?` | Note to employer |
| `attachedDocuments` | `String[]` | Attached document URLs or identifiers |
| `status` | `ApplicationStatus` | Default `SUBMITTED` |
| `employerNotes` | `Text?` | Employer notes |
| `matchPercent` | `Int?` | Optional matching score shown in application tables |
| `lastStatusMessage` | `String?` | Optional short status note |
| `interviewAt` | `DateTime?` | Optional scheduled interview time |
| `offerValidUntil` | `DateTime?` | Optional offer expiration time |
| `archivedAt` | `DateTime?` | Soft delete/archive from worker view |
| `archivedByWorkerAt` | `DateTime?` | Optional worker-specific archive timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Constraints: unique `jobId + workerId`. Indexes: `workerId`, `jobId`.

### `work_engagements`

Stores the actual work relationship after a worker is hired.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `jobId` | `String` | Foreign key to `jobs.id` |
| `workerId` | `String` | Foreign key to `worker_profiles.id` |
| `employerId` | `String` | Foreign key to `employer_profiles.id` |
| `applicationId` | `String?` | Unique optional foreign key to `applications.id` |
| `startDate` | `DateTime` | Engagement start |
| `endDate` | `DateTime?` | Engagement end |
| `agreedRate` | `Decimal(12,2)` | Agreed pay |
| `payStructure` | `PayStructure` | Pay structure |
| `status` | `EngagementStatus` | Default `ACTIVE` |
| `roleLabel` | `String?` | Optional cached job title / role label for workforce table (or compute from `jobs.title`) |
| `taskNotes` | `Text?` | Work notes |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`, `employerId`.

### `shift_logs`

Stores hours worked for an engagement.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `engagementId` | `String` | Foreign key to `work_engagements.id`, cascade delete |
| `date` | `Date` | Shift date |
| `hoursWorked` | `Decimal(5,2)` | Hours worked |
| `notes` | `Text?` | Shift notes |
| `loggedBy` | `String` | Default `employer` |
| `createdAt` | `DateTime` | Created timestamp |

Indexes: `engagementId`.

### `payments`

Stores payments from employers to workers for engagements.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `engagementId` | `String` | Foreign key to `work_engagements.id` |
| `workerId` | `String` | Foreign key to `worker_profiles.id` |
| `employerId` | `String` | Foreign key to `employer_profiles.id` |
| `amount` | `Decimal(12,2)` | Payment amount |
| `currency` | `String` | Default `XAF` |
| `mobileMoneyProvider` | `MomoProvider` | Mobile money provider |
| `recipientNumber` | `String` | Recipient phone/account number |
| `paymentPlatform` | `String?` | Gateway/platform label, e.g. FAPSHI |
| `paymentMethod` | `String?` | Human-readable payout method, e.g. MTN MoMo |
| `fapshiTransactionId` | `String?` | Unique payment gateway transaction ID |
| `fapshiReference` | `String?` | Gateway reference |
| `receiptNumber` | `String?` | Stable display reference for receipt/PDF |
| `idempotencyKey` | `String` | Unique key preventing duplicate payment requests |
| `status` | `PaymentStatus` | Default `PENDING` |
| `failureReason` | `String?` | Failure reason |
| `payPeriod` | `String?` | Pay period label |
| `archivedAt` | `DateTime?` | Soft archive timestamp |
| `initiatedAt` | `DateTime` | Payment initiation timestamp |
| `confirmedAt` | `DateTime?` | Payment confirmation timestamp |
| `completedAt` | `DateTime?` | Optional alias/stored completion timestamp for worker receipts |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Indexes: `workerId`, `employerId`, `engagementId`. Unique: `fapshiTransactionId`, `idempotencyKey`.

### `notifications`

Stores notifications sent or shown to users.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `userId` | `String` | Foreign key to `users.id`, cascade delete |
| `channel` | `NotificationChannel` | In-app, email, or SMS |
| `type` | `NotificationType` | Notification type |
| `title` | `String` | Notification title |
| `message` | `Text` | Notification message |
| `metadata` | `Json?` | Extra data for UI or processing |
| `read` | `Boolean` | Default `false` |
| `sentAt` | `DateTime` | Sent timestamp |

Indexes: `userId + read`.

### `ai_recommendations`

Stores generated job recommendations for workers.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `workerId` | `String` | Foreign key to `worker_profiles.id`, cascade delete |
| `jobId` | `String` | Foreign key to `jobs.id`, cascade delete |
| `relevanceScore` | `Float` | Recommendation score |
| `matchedSkills` | `String[]` | Skills matched between worker and job |
| `reasoning` | `Text?` | Recommendation explanation |
| `generatedAt` | `DateTime` | Generation timestamp |
| `expiresAt` | `DateTime` | Expiration timestamp |

Constraints: unique `workerId + jobId`. Indexes: `workerId + relevanceScore`.

### `fraud_flags`

Stores fraud or risk flags against users.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `targetUserId` | `String` | Flagged user ID |
| `flaggedById` | `String?` | User/admin who created the flag |
| `flagType` | `FlagType` | Type of flag |
| `reason` | `Text` | Reason for flag |
| `evidence` | `Json?` | Supporting evidence |
| `resolved` | `Boolean` | Default `false` |
| `resolvedNotes` | `Text?` | Resolution notes |
| `flaggedAt` | `DateTime` | Flag timestamp |
| `resolvedAt` | `DateTime?` | Resolution timestamp |

Indexes: `targetUserId`, `resolved`.

### `disputes`

Stores disputes between users, optionally tied to an engagement.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `raisedByUserId` | `String` | User who raised dispute |
| `againstUserId` | `String` | User dispute is against |
| `engagementId` | `String?` | Related engagement ID |
| `subject` | `String` | Dispute subject |
| `description` | `Text` | Dispute details |
| `evidence` | `Json?` | Supporting evidence |
| `status` | `DisputeStatus` | Default `OPEN` |
| `adminNotes` | `Text?` | Internal notes |
| `resolvedBy` | `String?` | Admin/user ID that resolved it |
| `resolution` | `Text?` | Resolution details |
| `createdAt` | `DateTime` | Created timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |
| `resolvedAt` | `DateTime?` | Resolution timestamp |

Indexes: `status`.

Note: this model stores ID strings but does not define Prisma relations to `users` or `work_engagements`.

### `admin_actions`

Stores audit log rows for admin actions.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `adminId` | `String` | Foreign key to `users.id` |
| `action` | `String` | Action name |
| `targetType` | `String` | Entity/table type affected |
| `targetId` | `String` | Entity ID affected |
| `notes` | `Text?` | Optional notes |
| `metadata` | `Json?` | Extra action metadata |
| `ipAddress` | `String?` | Request IP |
| `userAgent` | `String?` | Request user agent |
| `performedAt` | `DateTime` | Action timestamp |

Indexes: `adminId`, `targetType + targetId`, `performedAt`.

### `admin_review_notes`

Stores admin notes attached to any entity by `entityType` and `entityId`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `entityType` | `String` | Entity/table type being reviewed |
| `entityId` | `String` | Entity ID being reviewed |
| `adminId` | `String` | Foreign key to `users.id`, cascade delete |
| `note` | `Text` | Review note |
| `createdAt` | `DateTime` | Created timestamp |

Indexes: `entityType + entityId`.

### `platform_settings`

Stores key-value platform settings.

| Column | Type | Notes |
| --- | --- | --- |
| `key` | `String` | Primary key |
| `value` | `Json` | Setting value |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

Each row is one setting, such as a feature flag, limit, or platform configuration object.

### `session_logs`

Stores user session/audit events.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key, UUID |
| `userId` | `String` | Foreign key to `users.id`, cascade delete |
| `ipAddress` | `String?` | Request IP |
| `userAgent` | `String?` | Request user agent |
| `action` | `String` | Session action |
| `createdAt` | `DateTime` | Created timestamp |

Indexes: `userId`.

## Relationship Summary

| Parent | Child table(s) |
| --- | --- |
| `users` | `refresh_tokens`, `worker_profiles`, `employer_profiles`, `notifications`, `fraud_flags`, `admin_actions`, `admin_review_notes`, `session_logs` |
| `worker_profiles` | `applications`, `work_engagements`, `payments`, `worker_payment_accounts`, `ai_recommendations`, `saved_jobs`, `hidden_jobs`, `work_histories`, `educations`, `certifications`, `worker_documents`, `kyc_submissions`, `application_customizations`, `job_reports`, optional worker-created `jobs` |
| `employer_profiles` | `jobs`, `work_engagements`, `payments`, approved `jobs` |
| `jobs` | `applications`, `work_engagements`, `ai_recommendations`, `saved_jobs`, `hidden_jobs`, `job_reports`, `application_customizations` |
| `applications` | optional one-to-one `work_engagements` |
| `work_engagements` | `shift_logs`, `payments` |

## Important Data Design Notes

- Authentication data is separated from profile data. `users` stores account credentials and role, while worker/employer details live in profile tables.
- Worker profile history is normalized. Work history, education, certifications, documents, and KYC submissions are separate tables so each item can be updated or reviewed independently.
- Applications are immutable-ish snapshots. `applications.profileSnapshot` stores JSON so the submitted application can preserve what the worker looked like at the time of applying, even if the worker later edits their profile.
- Jobs have an approval lifecycle. `jobs.status`, `adminNotes`, `approvedById`, and `approvedAt` record whether a job is draft, under review, active, rejected, paused, or closed.
- The worker UI now includes worker-created jobs. Prefer `jobs.createdByWorkerId` plus `createdByType = WORKER`; alternatively use a separate worker job table with the same fields used by employer jobs: title, city, region, neighbourhood, description, required skills, required level, job type, duration, pay/currency/period, openings, start date/asap, requirements, responsibilities, draft flag, review status, and application count. Enforce verified KYC before creating drafts or submitted jobs.
- Application job titles should remain plain titles. Do not store or return titles with location suffixes such as `Software Engineer (Bamenda)`; return location separately as `city`, `region`, and `location`.
- Worker applications now have two consumer views: applications the worker submitted and applications received on worker-created jobs. The same `applications` table can serve both if `jobs.createdByWorkerId` is queryable.
- Worker profile strength needs stable stored or computed signals for personal info, skills, work history, payment details, professional summary, education/certifications, and KYC verification so every page can display the same completion percentage.
- Payments are tied to engagements. A payment row always references an engagement, worker, and employer.
- Employer public profile uses **`tagline`** (short) and **`about`** (long). API may expose `bio` as an alias for `about`. **`applicantsCount`** and **`employeesCount`** are computed aggregates, not stored columns.
- Workforce UI maps engagement status to tab filters: `active`, `terminated`, and optionally `rejected`; the terminated tab includes both terminated and rejected rows.
- External files are stored by URL. The database keeps URLs and metadata, while the actual files live outside the database.
- Admin notes and settings use flexible entity/key storage. `admin_review_notes` can attach to different entity types, while `platform_settings` stores JSON configuration by key.

## Reading This With Prisma

In Prisma code:

- Model names are PascalCase, such as `WorkerProfile`.
- Table names are snake_case through `@@map`, such as `worker_profiles`.
- Field names are usually camelCase in Prisma, such as `createdAt`.
- Some columns are explicitly snake_case through `@map`, such as `refresh_tokens.user_id`.

When adding or changing stored data, update `prisma/schema.prisma`, then create a migration in `prisma/migrations/`.
