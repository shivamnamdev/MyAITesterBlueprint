# Task Plan: Job Tracking Board Assistant & AI Resume Matcher (B.L.A.S.T.)

## Phase 0: Initialization (Protocol 0)
- [x] Create project memory files (`task_plan.md`, `findings.md`, `progress.md`)
- [x] Create project constitution (`gemini.md`) with expanded AI/Ollama & Scraper schemas
- [x] User approves Discovery answers & Schema

## Phase 1: B - Blueprint (Vision & Logic)
- [x] Discovery finalized:
  - North Star: Local React Kanban board + Daily Quotas + Resume-to-JD 1-10 match assessment & potential prospect bar.
  - Integrations: Local Ollama LLM for unstructured text parsing & scoring; built-in web page fetcher for job URLs; automatic offline fallback.
  - Source of Truth: Local SQLite database (`server/data/jobs.db`).
  - Delivery Payload: Responsive React Kanban UI + Daily goal widgets + Quick Add with Smart AI Parsing + Resume Evaluator modal.
  - Behavioral Rules: Non-blocking, instant offline fallback, seamless one-click drag & drop auto-save.
- [x] Define Data Schemas in `gemini.md` (`JobItem`, `SmartParsePayload`, `ResumeAssessmentPayload`, `DailyGoalProgress`)
- [x] Create Layer 1 technical SOPs in `architecture/`:
  - `architecture/sop_job_kanban_flow.md`
  - `architecture/sop_ollama_parser_scorer.md`

## Phase 2: L - Link (Connectivity)
- [x] Initialize project directory structure (`client/`, `server/`, `tools/`, `architecture/`)
- [x] Set up Node.js dependencies (`package.json`)
- [x] Implement `tools/ollama_client.js` with connectivity verification to `http://localhost:11434` and graceful heuristic fallback
- [x] Implement `tools/web_scraper.js` to fetch and parse job descriptions from URLs
- [x] Verify SQLite connection and schema migrations in `tools/db.js`

## Phase 3: A - Architect (The 3-Layer Build)
- [x] Build Layer 3 deterministic tools:
  - `tools/db.js`: SQLite tables (`jobs`, `daily_goals`, `resumes`) with CRUD operations
  - `tools/ollama_client.js`: Entity extraction prompt + regex fallback
  - `tools/resume_scorer.js`: TF-IDF/Keyword + Ollama 1-10 rating and bar metrics
  - `tools/web_scraper.js`: HTML sanitization & JD text isolation
- [x] Build Layer 2 API routes in `server/server.js`:
  - `GET /api/jobs`, `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`
  - `POST /api/parse-jd`: Scrapes URL or extracts structured fields from raw text
  - `POST /api/assess-resume`: Computes 1-10 rating, match bar, and gap analysis
  - `GET /api/daily-goals`, `POST /api/daily-goals`
  - `GET /api/resumes`, `POST /api/resumes`

## Phase 4: S - Stylize (Refinement & UI)
- [x] Build React Kanban Board UI with Tailwind CSS:
  - Header: Daily Targets widget (e.g. 5 Applied / 10 Searched with visual progress circles)
  - Search & Filters bar: Filter by Stage, Resume used, Discovery source, Search text
  - Kanban Columns: `To Search` | `To Apply` | `Applied` | `Interviewing` | `Offer` | `Rejected`
  - Kanban Cards: Title, Company, Source tag, Resume used tag, Match Score Badge (out of 10) with color bar, Applied date
  - Modal 1: Quick Add Job with "AI Smart Parse" tab (paste raw text or URL -> extracts fields automatically) + Manual tab
  - Modal 2: "AI Resume & JD Match Assessor" with animated score ring (e.g. 8.5 / 10), matching bar, strengths, missing keywords, and tailoring tips
  - Modal 3: Job Detail & Notes Editor (log interview stages, recruiter contacts, follow-up dates)
  - Modal 4: Resume Manager (save master resumes for quick selection)

## Phase 5: T - Trigger (Deployment & Verification)
- [x] Create single unified startup script `start.sh` and npm scripts
- [x] Test end-to-end:
  - Add job via URL scrape / raw text paste
  - Verify SQLite persistence
  - Evaluate Resume vs JD match scoring
  - Update stage via drag-and-drop / column buttons
  - Track daily goal counters
- [x] Update `EXECUTION_STEPS.md` with Project 6 execution instructions
- [x] Finalize Maintenance Log in `gemini.md` and `progress.md`
