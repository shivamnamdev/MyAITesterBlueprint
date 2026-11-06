# Findings & Research: Job Tracking Board Assistant

## Requirements & Constraints
- **Application Type**: Local React-based Kanban Board assistant.
- **Goal**: Track daily job search, applications, follow-ups, and responses across the user's job-hunting journey.
- **Local Persistence**: Must run locally with a lightweight SQLite database (`better-sqlite3` or `sqlite3`) stored directly in `server/data/jobs.db`.
- **AI Integrations**:
  - **Ollama Integration**: Connects to `http://localhost:11434` (e.g. `llama3.2`, `mistral`, or user-specified model) to auto-extract structured fields from unstructured text (emails, LinkedIn pastes, JD snippets) and compute 1-10 Resume Match Score.
  - **Web Page Scraper**: Fetches JD web pages (LinkedIn, Indeed, company portals), cleans HTML tags, and extracts the core job description.
  - **Deterministic Fallback**: If Ollama is offline or unavailable, automatically falls back to regex-based entity parsing and keyword/vector match scoring so user experience is never interrupted.
- **Core Card Fields**:
  - Job Title, Company Name, Job URL, Location, Salary Range
  - Discovery Source ("Where received": LinkedIn, Referral, Job Board, Recruiter outreach, etc.)
  - Application Destination ("Where applied": Company career site, LinkedIn Easy Apply, Email, etc.)
  - Resume Used ("Which resume version used": e.g. `Resume_QA_Lead_v2.pdf`)
  - Match Score (0 - 10) with visual bar and prospect analysis
  - Status / Stage: `To Search`, `To Apply`, `Applied`, `Interviewing`, `Offer`, `Rejected`
  - Applied Date & Response / Follow-up notes
  - Daily metrics: Daily targets for jobs searched vs jobs applied, showing daily progress.
