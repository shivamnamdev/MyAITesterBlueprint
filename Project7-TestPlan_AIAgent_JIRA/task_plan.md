# 📋 Task Plan: Test Plan & Test Cases AI Agent (JIRA + Multi-LLM)

> Protocol: B.L.A.S.T. | Architecture: A.N.T. 3-Layer + Modern React UI

---

## 🎯 North Star
An intelligent QA web application where users connect to JIRA via the UI using their API key, specify a Project ID and Ticket ID (Story, Bug, Epic), inspect the fetched requirement details, choose between Claude (Opus, Sonnet, Haiku), Local Ollama, or Gemini, and generate comprehensive, production-grade Test Plans and Test Cases with instant exports (CSV, Excel XLSX, Markdown, JSON, and JIRA write-back).

---

## 🏗️ Execution Phases

### Phase 1: B — Blueprint (Updated & Confirmed)
- [x] Defined updated schema in `gemini.md` for Multi-LLM support (Claude Opus, Sonnet, Haiku; Ollama; Gemini)
- [x] UI-first configuration model (credentials input in UI or `.env`)
- [x] JIRA ticket inspection (Summary, Description, Acceptance Criteria, Type, Status)
- [x] Excel XLSX + CSV + Markdown + JSON download specification

### Phase 2: L — Link (Tools Layer & Handshakes)
- [x] JIRA REST API v3 Client (`tools/jira_client.js`) with ADF recursive parser, custom headers, and v3/v2 fallback
- [x] Anthropic Claude Client (`tools/anthropic_client.js`) using `@anthropic-ai/sdk` with handshake verification
- [x] Local Ollama Client (`tools/ollama_client.js`) with dynamic model discovery (`/api/tags`)
- [x] Google Gemini Client (`tools/gemini_client.js`)
- [x] Unified LLM Router (`tools/llm_router.js`)
- [x] Export Engine (`tools/export_service.js`) with ExcelJS, CSV, Markdown generators
- [x] Phase 2 Handshake Verification Script (`tools/verify_connections.js`)
- [x] Dual credentials support: dynamic entry via Web UI or static entry via `.env`

### Phase 3: A — Architect (3-Layer Build) — COMPLETE
- [x] **Layer 1: Architecture (`architecture/`)**
  - [x] `architecture/sop_jira_fetcher.md`: REST API v3 authentication, issue/epic/story detail extraction, ADF text parsing, and test issue write-back
  - [x] `architecture/sop_llm_orchestrator.md`: Two-stage lifecycle (Stage 1 Plan review & approval ➔ Stage 2 Test Cases), document parsing, temperature 0.2
  - [x] `architecture/sop_export_engine.md`: Deterministic file exports (CSV, XLSX via ExcelJS, Markdown, JSON)
  - [x] `architecture/sop_google_docs.md`: OAuth2 flow and Google Docs API v1 document generation
- [x] **Layer 2: Navigation (Decision Making & Routing)**
  - [x] `server/routes/jira.js`: Test connection, ticket detail fetcher, issue writer
  - [x] `server/routes/llm.js`: Model discovery (Claude, dynamic local Ollama models, Gemini) + Anthropic key verification
  - [x] `server/routes/generate.js`: Two-stage endpoints: `/api/generate/plan`, `/api/generate/cases`, and `/api/generate/parse-doc`
  - [x] `server/routes/export.js`: File download streaming (XLSX, CSV, Markdown)
  - [x] `server/routes/gdocs.js`: Google Docs OAuth URL, callback, and document exporter
  - [x] `server/routes/health.js`: Service health liveness check
- [x] **Layer 3: Tools (Atomic Scripts & Engines)**
  - [x] `tools/document_parser.js`: Parses uploaded requirement docs (Microsoft Word DOCX, PDF, Markdown, TXT, JSON, YAML)
  - [x] `tools/jira_client.js`: JIRA REST client (v3 with v2 fallback, PAT support, URL cleaner)
  - [x] `tools/anthropic_client.js`: `@anthropic-ai/sdk` client for Claude 3.7 / 3.5 Sonnet, Opus, Haiku
  - [x] `tools/ollama_client.js`: Local Ollama dynamic model discovery and generation
  - [x] `tools/gemini_client.js`: Gemini 3.8 Flash generation client
  - [x] `tools/llm_router.js`: Two-stage prompt construction (Plan ➔ Approved Plan ➔ Cases)
  - [x] `tools/export_service.js`: ExcelJS 2-sheet workbook, RFC 4180 CSV, and Markdown generators
  - [x] `tools/gdocs_client.js`: Google Docs API v1 document creator and OAuth2 manager
  - [x] `tools/verify_connections.js`: CLI verification suite

### Phase 4: S — Stylize (Frontend React UI)
- [x] Vite configuration (`vite.config.js`) with API proxy
- [x] Responsive dark/light theme dashboard with Lucide QA icons
- [x] 4-Step Interactive Workflow:
  1. **JIRA Connection Card**: Base URL, Email, API Token with test connection status
  2. **Ticket Inspector**: Project Key & Ticket ID inputs, fetch preview of Story/Bug/Epic & Acceptance Criteria
  3. **LLM Selector**: Dropdown featuring Claude 3.7/3.5 Sonnet, Claude 3 Opus, Claude 3.5 Haiku, local Ollama models, and Gemini, plus Anthropic API key input
  4. **Test Suite Dashboard**:
     - Test Plan viewer (Scope, Objectives, Strategy, Risks, Entry/Exit criteria)
     - Test Cases interactive table (Priority badges, Type tags, Preconditions, Step-by-step actions & expected results)
     - Export Action Bar (Download Excel `.xlsx`, Download CSV, Download Markdown, Download JSON)

### Phase 5: T — Trigger & Documentation
- [x] Update `EXECUTION_STEPS.md` with Project 7 instructions
- [x] Launcher script `start.sh` with client + server dual start
- [x] Verification test suite


---

## ⚡ Phase 2: L — Link (Connectivity)

### Files Built
- [x] `package.json` — All dependencies (@google/genai, axios, express, googleapis, exceljs)
- [x] `.env.example` — API key template
- [x] `.gitignore` — Protects .env, .tmp/, node_modules
- [x] `tools/jira_client.js` — Minimal JIRA handshake (`testConnection()`)
- [x] `tools/gemini_client.js` — Minimal Gemini ping (`testConnection()`)
- [x] `tools/gdocs_client.js` — Google OAuth credential check (`checkCredentials()`)
- [x] `tools/verify_connections.js` — CLI runner for all 3 handshakes
- [x] `server/index.js` — Express server entry
- [x] `server/routes/health.js` — `GET /api/health`
- [x] `server/routes/jira.js` — `GET /api/jira/test-connection`
- [x] `server/routes/gemini.js` — `GET /api/gemini/test-connection`
- [x] `server/routes/gdocs.js` — `GET /api/gdocs/status`
- [x] `server/routes/generate.js` — `POST /api/generate` (501 stub — Phase 3)
- [x] `start.sh` — One-click launcher
- [x] `npm install` — ✅ All packages installed

### Integration Verification — Awaiting User API Keys
- [ ] Copy `.env.example` → `.env` and fill in credentials
- [ ] `GET /api/jira/test-connection` → `200 OK` with user + project name
- [ ] `GET /api/gemini/test-connection` → `200 OK` with `{"status":"ok"}`
- [ ] `GET /api/gdocs/status` → configured or optional warning
- [ ] `npm run verify` passes all checks → **Phase 2 PASSED**

---

## ⚙️ Phase 3: A — Architect (3-Layer Build)

### Layer 1 — Architecture SOPs
- [ ] `architecture/sop_jira_fetcher.md` — JIRA fetch + write-back logic
- [ ] `architecture/sop_ai_generator.md` — Gemini prompt engineering + schema enforcement
- [ ] `architecture/sop_google_docs.md` — GDocs API export logic

### Layer 2 — Navigation (Express Server)
- [ ] `server/index.js` — Express entry point
- [ ] `server/routes/generate.js` — `POST /api/generate` route
- [ ] `server/routes/jira.js` — JIRA fetch, test-connection, write-back routes
- [ ] `server/routes/gdocs.js` — Google Docs export + OAuth routes
- [ ] `server/routes/health.js` — `GET /api/health`

### Layer 3 — Tools (Atomic Scripts)
- [ ] `tools/jira_client.js` — JIRA API v3 wrapper
- [ ] `tools/gemini_client.js` — Gemini `google-genai` SDK wrapper (structured JSON output)
- [ ] `tools/gdocs_client.js` — Google Docs API v1 wrapper
- [ ] `tools/formatter.js` — JSON → JIRA ADF / Markdown / GDocs formatter

### Frontend (React/Vite)
- [ ] `src/App.jsx` — Main app shell
- [ ] `src/components/ConnectionStatus.jsx` — JIRA + Gemini + GDocs status badges
- [ ] `src/components/RequirementsPanel.jsx` — JIRA story picker or manual input
- [ ] `src/components/GeneratePanel.jsx` — Options + Generate button
- [ ] `src/components/TestPlanView.jsx` — Rendered Test Plan output
- [ ] `src/components/TestCasesTable.jsx` — Test cases grid with filters
- [ ] `src/components/ExportPanel.jsx` — Export to JIRA / GDocs controls

---

## ✨ Phase 4: S — Stylize (Refinement & UI)

- [ ] Professional dark-themed UI with QA/testing aesthetic
- [ ] Test cases displayed in a sortable, filterable table
- [ ] Test Plan rendered as a formatted document preview
- [ ] Copy to Clipboard / Download Markdown / Download JSON buttons
- [ ] Status badges (Pass/Fail/Blocked) with color coding
- [ ] Responsive layout (desktop-first)

---

## 🛰️ Phase 5: T — Trigger (Deployment)

- [ ] `start.sh` — One-click startup script
- [ ] `.env.example` — Template for environment variables
- [ ] `EXECUTION_STEPS.md` updated with Project 7 entry
- [ ] README with setup instructions

---

## 📁 Final File Structure
```
Project7-TestPlan_AIAgent_JIRA/
├── BLAST.md                        # Protocol reference
├── gemini.md                       # Project Constitution (schemas + rules)
├── task_plan.md                    # This file
├── findings.md                     # Research log
├── progress.md                     # Build log
├── .env                            # API keys (gitignored)
├── .env.example                    # API key template
├── package.json                    # Node dependencies
├── vite.config.js                  # Vite bundler config
├── index.html                      # App entry
├── start.sh                        # One-click launcher
├── architecture/
│   ├── sop_jira_fetcher.md
│   ├── sop_ai_generator.md
│   └── sop_google_docs.md
├── server/
│   ├── index.js                    # Express server
│   └── routes/
│       ├── generate.js
│       ├── jira.js
│       ├── gdocs.js
│       └── health.js
├── tools/
│   ├── jira_client.js
│   ├── gemini_client.js
│   ├── gdocs_client.js
│   └── formatter.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── components/
│       ├── ConnectionStatus.jsx
│       ├── RequirementsPanel.jsx
│       ├── GeneratePanel.jsx
│       ├── TestPlanView.jsx
│       ├── TestCasesTable.jsx
│       └── ExportPanel.jsx
├── data/                           # Persisted sessions (optional SQLite)
└── .tmp/                           # Intermediate files, OAuth tokens (gitignored)
```
