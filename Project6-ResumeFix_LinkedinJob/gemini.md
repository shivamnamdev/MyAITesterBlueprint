# 📜 Project Constitution: Job Tracking Board Assistant & AI Resume Matcher

## 1. Project Map & Core Identity
- **Goal:** A local React-based Kanban Board assistant that organizes the entire job hunting journey. Daily tracking of search & application quotas, smart auto-fill of job fields from unstructured text or URL scraping via local Ollama LLM, and Resume-to-JD fit assessment with a 1-10 rating, breakdown bar, and gap analysis.
- **Protocol Standard:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) with A.N.T. 3-Layer Architecture.
- **Location:** `Project6-ResumeFix_LinkedinJob`

## 2. Architectural Invariants
- **Layer 1 (Architecture - `architecture/`):** Technical SOPs for:
  - `sop_job_kanban_flow.md`: Stage lifecycle transitions, daily metrics calculations, and persistence.
  - `sop_ollama_parser_scorer.md`: Unstructured JD/text entity extraction, web page scraping protocol, and Resume vs. JD scoring algorithms.
- **Layer 2 (Navigation):** Routing API requests between the React frontend, deterministic database layer, and AI tools.
- **Layer 3 (Tools - `tools/`):** Atomic, deterministic scripts/services:
  - `tools/db.js`: Local SQLite database engine with automatic schema migrations.
  - `tools/web_scraper.js`: Safe, headless web page extractor that pulls clean job description text from URLs.
  - `tools/ollama_client.js`: Local Ollama integration (`llama3.2` / `mistral` / configurable) with deterministic rule-based fallback if Ollama is offline.
  - `tools/resume_scorer.js`: Algorithmic & LLM evaluator producing 1-10 score, pros, missing keywords, and match bar metric.
- **Zero Cloud Dependence:** Works 100% locally. SQLite single-file database (`data/jobs.db`) with zero external cloud subscriptions required.

## 3. Data Schemas (Input / Output Shapes)

### 3.1 Job Record Schema (`JobItem`)
```json
{
  "id": "string (UUID or auto-increment integer)",
  "jobTitle": "string (Required - e.g. Staff QA Engineer)",
  "company": "string (Required - e.g. Acme Corp)",
  "jobUrl": "string (Optional - link to original job posting)",
  "sourceReceived": "string (e.g. LinkedIn, Recruiter InMail, Referral, Indeed, Wellfound, Career Fair)",
  "platformApplied": "string (e.g. Company Portal, LinkedIn Easy Apply, Greenhouse, Lever, Workday)",
  "resumeUsed": "string (e.g. Resume_QA_Architect_2026.pdf)",
  "resumeText": "string (Text of the resume used for scoring)",
  "jdText": "string (Full text of Job Description)",
  "stage": "To Search | To Apply | Applied | Interviewing | Offer | Rejected",
  "matchScore": 8.5,
  "matchBreakdown": {
    "score": 8.5,
    "ratingLabel": "Strong Match | Moderate Match | Low Match",
    "strengths": ["Test Automation", "CI/CD", "Playwright"],
    "missingKeywords": ["K8s", "Docker"],
    "recommendations": "Highlight containerization experience in bullet 2."
  },
  "salaryRange": "string (e.g. $140,000 - $165,000 / yr)",
  "location": "string (e.g. Remote / Hybrid - Austin, TX)",
  "contactPerson": "string (e.g. Jane Doe - Recruiter)",
  "appliedDate": "ISO-8601 Date string | null",
  "followUpDate": "ISO-8601 Date string | null",
  "notes": "string (Interview rounds, questions asked, feedback)",
  "createdAt": "ISO-8601 Timestamp",
  "updatedAt": "ISO-8601 Timestamp"
}
```

### 3.2 Smart Parse & Autofill Schema (`SmartParsePayload`)
```json
// Request
{
  "rawText": "string (Pasted job post, email, or LinkedIn snippet)",
  "url": "string (Optional - URL to scrape if provided)"
}

// Response
{
  "success": true,
  "data": {
    "jobTitle": "string",
    "company": "string",
    "location": "string",
    "salaryRange": "string",
    "sourceReceived": "string",
    "platformApplied": "string",
    "jdText": "string",
    "contactPerson": "string"
  },
  "engineUsed": "ollama | rule-based-fallback"
}
```

### 3.3 Resume Assessment & Scoring Schema (`ResumeAssessmentPayload`)
```json
// Request
{
  "jdText": "string (Job requirements)",
  "resumeText": "string (Candidate resume)",
  "jobTitle": "string",
  "company": "string"
}

// Response
{
  "score": 8.5,
  "ratingOutOfTen": 8.5,
  "percentage": 85,
  "ratingLabel": "Strong Match",
  "strengths": ["5+ years Playwright", "API testing", "Agile leadership"],
  "gaps": ["No explicit GraphQL mention", "AWS certification not listed"],
  "tailoringTips": [
    "Mention performance testing in project 1",
    "Include Docker container experience"
  ],
  "engineUsed": "ollama | rule-based-fallback"
}
```

### 3.4 Daily Goals & Activity Tracker Schema (`DailyGoalProgress`)
```json
{
  "date": "YYYY-MM-DD",
  "targetSearches": 10,
  "targetApplications": 5,
  "actualSearched": 8,
  "actualApplied": 5,
  "interviewsScheduled": 1,
  "offersReceived": 0,
  "rejections": 0
}
```

## 4. Behavioral Rules
- **Non-blocking AI:** If Ollama is offline or slow, the application must immediately fall back to regex/heuristic extraction and rule-based keyword matching so the user is never blocked from saving a job.
- **Data Persistence:** Every drag-and-drop or card edit must be auto-saved directly to SQLite without manual "save all" buttons.
- **Smart Autofill:** When pasting raw text or a job URL into the Quick Add modal, the system extracts company, title, location, and JD text, and auto-populates the form fields for one-click confirmation.
- **Visual Kanban:** Clear color-coded columns with badges showing match score out of 10 (`green >= 7.5`, `amber 5-7.4`, `red < 5`).
- **Time Saver:** Resume profiles stored in local DB so users can pick their standard resumes from a single dropdown (`QA Lead`, `SDET`, `Full-Stack`, etc.).

## 5. Maintenance & Error Log
- `2026-11-06`: Project initialized under B.L.A.S.T. Protocol 0 & Phase 1 Blueprint approved.
- `2026-11-06`: Built 3-Layer Architecture (tools/db.js, tools/ollama_client.js, tools/web_scraper.js, tools/resume_scorer.js).
- `2026-11-06`: Built React Kanban UI with daily quota tracking, AI auto-fill extraction, and 1-10 Resume Fit Assessor.
- `2026-11-06`: Verified production build and updated EXECUTION_STEPS.md.
