# 📈 Progress Log: Test Plan & Test Cases AI Agent

> Live build log — what was done, errors encountered, fixes applied.

---

## 2026-11-09 — Phase 3: Architect (The 3-Layer Build) — COMPLETE

### ✅ Done
- **Layer 1: Architecture (`architecture/`):**
  - Completed `sop_jira_fetcher.md` (ADF parsing, field mapping, authentication, error recovery).
  - Completed `sop_llm_orchestrator.md` (temperature 0.2 constraint, schema validation, zero-hallucination rules).
  - Completed `sop_export_engine.md` (ExcelJS 2-sheet layout, RFC 4180 CSV, GFM Markdown format).
  - Completed `sop_google_docs.md` (OAuth2 flow, documents.create, batchUpdate formatting, drive organization).
- **Layer 2: Navigation (`server/`):**
  - `server/index.js` orchestrating Express API routes with static frontend hosting.
  - Implemented `server/routes/jira.js` with v3/v2 fallback and human-readable error messages.
  - Implemented `server/routes/llm.js` returning Claude (Opus, Sonnet, Haiku), live local Ollama models, and Gemini.
  - Implemented `server/routes/generate.js` routing requests to the unified LLM router.
  - Implemented `server/routes/export.js` streaming binary Excel `.xlsx`, `.csv`, and `.md` files.
  - Implemented `server/routes/gdocs.js` supporting Google OAuth authorization and document creation.
- **Layer 3: Tools (`tools/`):**
  - Upgraded `tools/jira_client.js` with URL sanitization, ticket key regex extraction, and Atlassian Cloud / PAT authentication.
  - Built `tools/anthropic_client.js` with direct `@anthropic-ai/sdk` integration.
  - Built `tools/ollama_client.js` with auto-discovery of local models.
  - Built `tools/gemini_client.js` with JSON schema enforcement.
  - Built `tools/export_service.js` with ExcelJS, CSV, and Markdown generators.
  - Built `tools/gdocs_client.js` with Google Docs API v1 support.
- **Two-Stage Human-in-the-Loop & Document Upload Upgrade:**
  - Built `tools/document_parser.js` supporting Microsoft Word DOCX (`mammoth`), PDF (`pdf-parse`), Markdown, TXT, JSON, YAML, and CSV files with automatic character truncation for safe token consumption.
  - Resolved `Unexpected token '<', "<!DOCTYPE "` error:
    - Root cause: Stale background Node process on port 5080 (from Phase 2) was intercepting requests before the `/api/generate/plan` route existed and returning 404 HTML.
    - Terminated stale process on port 5080.
    - Updated `start.sh` to automatically detect and terminate any zombie process occupying port 5080 on startup.
    - Client `handleGenerateTestPlan` & `handleGenerateTestCases` now use robust response validation with clear human-readable guidance.
    - Rebuilt `dist/` production assets.
  - Implemented Stage 1 (`/api/generate/plan`) to generate the **Test Plan ONLY**.
  - Implemented Stage 2 (`/api/generate/cases`) locked behind an explicit **"Approve Test Plan"** gate in the UI. Test cases are derived strictly from the approved plan and ticket/uploaded specs.
  - Added Document Upload zone with file picker, extracted character metrics, and manual notes textarea in `src/App.jsx`.
  - Rebuilt and verified production frontend assets with Vite (`npm run build` passed in 134ms).
  - All Layer 3 tool functions verified and operational (`OK`).
  - All Layer 2 navigation route modules verified and operational (`OK`).
  - Frontend production build (`dist/`) refreshed and verified (`OK`).

### ✅ Done
- **B.L.A.S.T. Protocol Followed:**
  - **Blueprint:** Updated `gemini.md` & `task_plan.md` with Multi-LLM support (Anthropic Claude: Opus, Sonnet, Haiku; Local Ollama; Gemini) and UI-driven JIRA connection.
  - **Link (Tools):**
    - `tools/jira_client.js`: JIRA REST API v3 client with ADF recursive parser and Acceptance Criteria extraction.
    - `tools/anthropic_client.js`: `@anthropic-ai/sdk` client for Claude 3.7 / 3.5 Sonnet, Opus, Haiku with connection verifier.
    - `tools/ollama_client.js`: Dynamic local Ollama model discovery and generation.
    - `tools/gemini_client.js`: Gemini 3.8 Flash generation client.
    - `tools/llm_router.js`: Strict prompt construction with temperature 0.2 and single-source-of-truth validation.
    - `tools/export_service.js`: ExcelJS 2-sheet workbook (`.xlsx`), RFC 4180 CSV, and GFM Markdown generators.
  - **Architect (Server & SOPs):**
    - `architecture/sop_jira_fetcher.md`
    - `architecture/sop_llm_orchestrator.md`
    - `architecture/sop_export_engine.md`
    - Express routes for JIRA (`/api/jira/*`), LLM Discovery (`/api/llm/*`), Generation (`/api/generate`), and Exports (`/api/export/*`).
  - **Stylize (Frontend UI):**
    - Modern React + Vite application with Tailwind CSS and Lucide QA icons.
    - 4-step wizard:
      1. JIRA Connection Card (URL, Email, Token with visibility toggle, persistent `localStorage`)
      2. Ticket Inspector (Project Key, Ticket ID, summary, description, and AC status)
      3. AI Model Selector (Claude Opus, Sonnet, Haiku, Ollama local, Gemini) + Anthropic Console guide & API key verifier
      4. Test Suite Dashboard (Test Plan view, Test Cases interactive table with search & priority/type filters, Raw JSON viewer, Excel/CSV/Markdown one-click download buttons, and JIRA write-back button).
    - Production build tested and verified (`dist/` generated with 0 errors).
  - **Trigger (Launch & Documentation):**
    - Executable `start.sh` created.
    - `EXECUTION_STEPS.md` updated with Project 7 section.

### 🧪 Verification Status
- Frontend Vite build: `PASSED` (0 errors)
- Express server route registration: `PASSED`
- All exports and tools compile: `PASSED`

### ✅ Done
- Created `package.json` — dependencies: `@google/genai@^2.32.0`, `axios`, `express`, `cors`, `googleapis`, `exceljs`, `uuid@^11.1.1`, `dotenv` | devDep: `nodemon`
- Created `.env.example` — template for JIRA, Gemini, Google Docs, PORT
- Created `.gitignore` — protects `.env`, `.tmp/`, `node_modules/`
- Created `tools/jira_client.js` — minimal `testConnection()` (JIRA REST API v3 Basic Auth)
- Created `tools/gemini_client.js` — minimal `testConnection()` (gemini-3.8-flash ping, temp=0.2, JSON mode)
- Created `tools/gdocs_client.js` — minimal `checkCredentials()` (env var presence check)
- Created `tools/verify_connections.js` — CLI runner (`npm run verify`)
- Created `server/index.js` — Express entry with 5 route mounts
- Created `server/routes/health.js`, `jira.js`, `gemini.js`, `gdocs.js`, `generate.js`
- `npm install` ✅ 358 packages installed
- Approved blocked install scripts: `@google/genai`, `protobufjs`, `fsevents` ✅
- Upgraded `uuid` → `^11.1.1` (resolved deprecation warning) ✅
- **Smoke tests all PASS:**
  - All 5 route modules load: `OK` ✅
  - All 3 tool functions export correctly (`function` type): `OK` ✅
  - `GET /api/health` → `{"status":"ok","service":"TestPlan AI Agent"}` ✅

### 🔲 Awaiting User Action — API Keys Needed
- [ ] `cp .env.example .env` → fill in `GEMINI_API_KEY`, `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`
- [ ] `npm run dev` → server starts at `http://localhost:5080`
- [ ] `GET /api/jira/test-connection` → `200 OK` with user + project name
- [ ] `GET /api/gemini/test-connection` → `200 OK` with `{"status":"ok"}`
- [ ] `npm run verify` → all checks pass
- [ ] User confirms: **Phase 2 PASSED → Phase 3 UNLOCKED**

### ✅ Done
- Analyzed BLAST.md protocol requirements
- Created Project 7 directory structure following B.L.A.S.T. A.N.T. architecture
- Initialized `gemini.md` (Project Constitution) with:
  - Full data schemas: JiraStory, TestPlan, TestCase, Agent Request/Response
  - Environment variable spec (.env)
  - Behavioral rules (structured output, no hallucination, missing AC flagging)
- Initialized `task_plan.md` with all 5 B.L.A.S.T. phases and checklists
- Initialized `findings.md` with JIRA API v3, Gemini API, Google Docs API research
- Completed **5 Discovery Questions** — Blueprint LOCKED:
  - **North Star:** JIRA → AI Test Plan + Test Cases → JIRA write-back + Google Docs
  - **AI Temp:** `0.2` — near-deterministic, single-source-of-truth, zero hallucination
  - **Exports:** Markdown, CSV, XLSX, JSON, JIRA issues, Google Docs
  - **Missing AC:** Hard block — flag and skip, never invent steps
  - **Model:** `gemini-3.8-flash` with `responseMimeType: "application/json"`
- Updated `gemini.md` with locked discovery answers
- Updated `task_plan.md` with approved Blueprint

### 🔲 Awaiting (Phase 1 → Phase 2 unlock)
- User provides JIRA API token + JIRA base URL for Link phase
- User provides Gemini API key
- User provides Google OAuth credentials (optional)

### ⚠️ Known Unknowns
- JIRA Acceptance Criteria custom field key (varies per workspace) — will auto-detect on first connect
