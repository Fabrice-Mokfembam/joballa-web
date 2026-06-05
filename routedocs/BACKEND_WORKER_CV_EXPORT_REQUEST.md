# Backend Request: Persistent Worker Profile CV Export

## Goal

Allow a signed-in worker to click **Export CV** from their profile. The backend must:

1. Generate a professional PDF CV from the worker's current Joballa profile.
2. Store the generated PDF permanently in the configured file storage.
3. Immediately return the PDF as a download.
4. Allow the worker to download the previously generated PDF again later.

The frontend must not generate this PDF. PDF layout, generation, and storage belong to the backend.

## Important Existing Route Issue

The current routedoc lists:

```http
GET /worker/profile/cv-export
```

The current frontend implementation expects this route to return profile JSON. That behavior does not satisfy CV export.

Please replace it with the binary PDF download contract below.

## Required Routes

### Generate And Download Latest CV

```http
POST /worker/profile/cv-export
Authorization: Bearer <worker-token>
```

Behavior:

- Load the authenticated worker and their complete profile.
- Generate a new PDF from the latest profile data.
- Upload/store the PDF before responding.
- Replace or mark the worker's previous generated CV export as superseded.
- Return the newly generated PDF directly as the response.

Success response:

```http
HTTP/1.1 201 Created
Content-Type: application/pdf
Content-Disposition: attachment; filename="joballa-cv-<safe-worker-name>.pdf"
X-Joballa-Document-Id: <generated-document-id>
X-Joballa-Generated-At: <ISO-8601-date>

<PDF binary>
```

No request body is required.

### Download Previously Generated CV

```http
GET /worker/profile/cv-export
Authorization: Bearer <worker-token>
```

Behavior:

- Find the authenticated worker's latest successfully generated CV export.
- Return the stored PDF without regenerating it.

Success response:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="joballa-cv-<safe-worker-name>.pdf"

<PDF binary>
```

If the worker has never generated a CV:

```json
{
  "statusCode": 404,
  "code": "GENERATED_CV_NOT_FOUND",
  "message": "Generate your CV before downloading it."
}
```

## Optional Metadata Route

This is recommended so the frontend can decide whether to show **Export CV** or **Download CV**.

```http
GET /worker/profile/cv-export/status
Authorization: Bearer <worker-token>
```

Response:

```ts
type WorkerCvExportStatus = {
  available: boolean;
  documentId: string | null;
  fileName: string | null;
  generatedAt: string | null;
  sourceProfileUpdatedAt: string | null;
  isOutdated: boolean;
};
```

`isOutdated` should be `true` when the worker profile changed after the PDF was generated.

## PDF Contents

Use only profile information belonging to the authenticated worker:

- Profile photo, when available
- Full name
- Professional title
- City, region, and country
- Phone and email, when allowed for the worker's own export
- Professional summary
- Languages
- Skills
- Preferred job categories/types
- Work experience
- Education
- Certifications

Do not include:

- KYC images or identity-document numbers
- Payment account details
- Internal verification notes
- Internal IDs
- Application history
- Private admin information

Empty sections should be omitted instead of displaying blank headings.

## Suggested Implementation

PDFKit is acceptable. Puppeteer/HTML-to-PDF or another maintained server-side PDF library is also acceptable.

Suggested service flow:

1. Query the complete worker profile and user contact details.
2. Render the PDF into a buffer or temporary stream.
3. Upload it to the project's configured object/file storage.
4. Save the generated file record and generation timestamp in the database.
5. Return/stream the same PDF buffer to the requester.

Do not store generated PDFs only on the application server's local filesystem because they must survive deployments and restarts.

## Persistence

Recommended options:

- Add fields such as `generatedCvUrl`, `generatedCvDocumentId`, and `generatedCvAt` to the worker profile; or
- Store it as a worker document with a dedicated type such as `GENERATED_CV`.

Please keep uploaded CVs separate from generated CVs:

- `POST /worker/profile/cv` remains the worker-uploaded CV/resume.
- `POST /worker/profile/cv-export` creates a Joballa-generated CV from profile data.

The generated file must remain downloadable until the worker generates a replacement or deletes their account.

## Security And Reliability

- Require an authenticated worker token.
- A worker may only generate or download their own CV.
- Sanitize the worker name used in the filename.
- Escape all profile text before rendering.
- Apply a reasonable generation timeout and file-size limit.
- Do not save a database record until file upload succeeds.
- If generation or upload fails, return an error and retain the previous successful export.
- Log generation failures without logging private profile contents.

Suggested errors:

```json
{
  "statusCode": 422,
  "code": "PROFILE_INSUFFICIENT_FOR_CV",
  "message": "Complete your name and professional summary before exporting your CV."
}
```

```json
{
  "statusCode": 500,
  "code": "CV_GENERATION_FAILED",
  "message": "We could not generate your CV. Please try again."
}
```

## Acceptance Criteria

- Clicking **Export CV** generates a valid, non-empty PDF from current profile data.
- The same click starts a browser download without requiring another page.
- The generated PDF is stored successfully before the response completes.
- `GET /worker/profile/cv-export` downloads the latest stored generated PDF later.
- Generating a replacement does not leave the worker without a downloadable CV if generation fails.
- Workers cannot access another worker's CV.
- Generated PDFs survive backend deployments and restarts.
- The PDF excludes KYC and payment information.
- Routes are documented in `routedocs/FRONTEND_WORKER_ROUTES.md` after implementation.

## Frontend Contract Needed

Once implemented, please confirm:

1. Whether the response is a direct PDF binary as specified.
2. The final route paths and HTTP methods.
3. Whether `/status` is implemented.
4. Any minimum profile fields required before generation.
5. Whether the generated document is automatically replaced or versioned.

