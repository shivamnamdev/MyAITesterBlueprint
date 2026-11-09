# 📜 Project Constitution: Test Plan & Test Cases AI Agent (JIRA + Multi-LLM)

## 1. Project Map & Core Identity
- **Goal:** An intelligent QA Agent with a modern React UI where users can configure their JIRA credentials (URL, Email, API Key), enter a Project ID and Ticket ID (Story, Bug, Epic), inspect the fetched requirement details, and select between Local LLMs (Ollama) or Cloud LLMs (Anthropic Claude: Opus, Sonnet, Haiku; Gemini) to automatically generate comprehensive Test Plans and step-by-step Test Cases with one-click export (CSV, XLSX, Markdown, JSON, JIRA write-back).
- **Protocol Standard:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) with A.N.T. 3-Layer Architecture.
- **Location:** `Project7-TestPlan_AIAgent_JIRA`
- **Supported LLMs:**
  - **Anthropic Claude (Default Cloud):** `claude-3-7-sonnet`, `claude-3-5-sonnet-latest`, `claude-3-opus-latest`, `claude-3-5-haiku-latest`
  - **Local Ollama:** `llama3.2`, `codellama`, `mistral`, `deepseek-r1`, or auto-detected local models via `http://localhost:11434/api/tags`
  - **Google Gemini:** `gemini-3.8-flash`

## 2. Architectural Invariants
- **Layer 1: Architecture (`architecture/`)**
  - `sop_jira_fetcher.md`: SOP for JIRA REST API v3 authentication, issue/epic/story detail extraction, ADF text parsing, and test issue write-back.
  - `sop_llm_orchestrator.md`: SOP for multi-model LLM generation (Anthropic Claude, Ollama, Gemini) enforcing structured JSON schema at temperature 0.2.
  - `sop_export_engine.md`: SOP for deterministic file exports (CSV, XLSX via ExcelJS, Markdown, JSON).
- **Layer 2: Navigation (`server/`)**
  - Express API router coordinating credentials verification, JIRA ticket fetching, LLM routing, and export streaming.
- **Layer 3: Tools (`tools/`)**
  - `tools/jira_client.js`: JIRA REST API v3 client (test connection, fetch issue details by ID/Key, parse ADF, push issues).
  - `tools/anthropic_client.js`: Anthropic Claude client (`@anthropic-ai/sdk`) for Claude Opus, Sonnet, Haiku with prompt formatting.
  - `tools/ollama_client.js`: Local Ollama client (HTTP REST to `http://localhost:11434`) with auto-discovery of models.
  - `tools/gemini_client.js`: Gemini API client (`@google/genai`) for `gemini-3.8-flash`.
  - `tools/llm_router.js`: Unified orchestrator routing prompts to the user's selected LLM.
  - `tools/export_service.js`: Deterministic exporter for CSV, XLSX, Markdown, and JSON.
- **Layer 4: Frontend UI (`src/`)**
  - Interactive React + Vite application with modern QA theme, Lucide icons, responsive layout, and step-by-step wizard.

## 3. UI & Credentials Architecture
- **Zero Lock-In Authentication:** Credentials (JIRA API Key, Anthropic API Key) can be entered directly via the Web UI and cached in browser `localStorage` or supplied via `.env`.
- **Browser-Friendly Anthropic Login Guidance:** UI displays an Anthropic setup card with direct link to `console.anthropic.com/settings/keys` to copy their API key or sign in via browser.


```
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# JIRA Integration
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=your@email.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_KEY=PROJ

# Google Docs (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5080/auth/google/callback
GOOGLE_DRIVE_FOLDER_ID=optional_folder_id

# Server
PORT=5080
```

## 4. Data Schemas (Input / Output Shapes)

### 4.1 JIRA Story / Requirement Schema (`JiraStory`)
```json
{
  "issueKey": "PROJ-42",
  "issueType": "Story | Epic | Task | Bug",
  "summary": "string (Issue title / requirement)",
  "description": "string (Full JIRA description, ADF converted to plain text)",
  "acceptanceCriteria": "string (Extracted AC from description or custom field)",
  "priority": "Critical | High | Medium | Low",
  "labels": ["regression", "smoke"],
  "epicKey": "PROJ-10",
  "epicName": "string",
  "status": "To Do | In Progress | Done",
  "assignee": "string",
  "url": "https://your-org.atlassian.net/browse/PROJ-42"
}
```

### 4.2 Test Plan Schema (`TestPlan`)
```json
{
  "id": "UUID",
  "title": "Test Plan: [Epic/Feature Name]",
  "version": "1.0",
  "createdAt": "ISO-8601 Timestamp",
  "scope": "string (What is in/out of scope — derived from JIRA epic description ONLY)",
  "objectives": ["string — derived from JIRA AC and story summaries"],
  "testStrategy": {
    "types": ["Functional", "Integration", "Regression", "E2E", "Smoke"],
    "environments": ["QA", "Staging", "Production"],
    "entryExitCriteria": {
      "entry": ["All stories in Done", "Build deployed to QA"],
      "exit": ["Zero P1 bugs open", "95% test pass rate"]
    }
  },
  "linkedStories": ["PROJ-42", "PROJ-43"],
  "testCaseIds": ["TC-001", "TC-002"],
  "jiraTestPlanKey": "PROJ-99",
  "googleDocUrl": "https://docs.google.com/document/d/xxxx",
  "warning": "string | null — set if any story is missing Acceptance Criteria"
}
```

### 4.3 Test Case Schema (`TestCase`)
```json
{
  "id": "TC-001",
  "title": "string (Descriptive test case title)",
  "linkedStory": "PROJ-42",
  "priority": "Critical | High | Medium | Low",
  "type": "Functional | Integration | Regression | Negative | Boundary | Smoke",
  "preconditions": "string",
  "steps": [
    {
      "stepNumber": 1,
      "action": "string (What tester does)",
      "testData": "string (Input values used)",
      "expectedResult": "string (What should happen)"
    }
  ],
  "actualResult": "",
  "status": "Not Executed | Pass | Fail | Blocked | Skipped",
  "automationStatus": "Manual | Automated | To Automate",
  "tags": ["smoke", "login", "happy-path"],
  "jiraTestKey": "PROJ-100"
}
```

### 4.4 Agent Request/Response Schema

```json
// Generate Request (POST /api/generate)
{
  "source": "jira | manual",
  "jiraProjectKey": "PROJ",
  "epicKey": "PROJ-10",
  "storyKeys": ["PROJ-42", "PROJ-43"],
  "manualRequirement": "string (optional — paste raw requirements if no JIRA)",
  "generateTestPlan": true,
  "generateTestCases": true,
  "exportToJira": false,
  "exportToGoogleDocs": false
}

// Generate Response
{
  "success": true,
  "sessionId": "UUID",
  "testPlan": { /* TestPlan */ },
  "testCases": [ /* TestCase[] */ ],
  "warnings": ["PROJ-43: Acceptance Criteria missing — test cases skipped"],
  "exportResults": {
    "jira": { "testPlanKey": "PROJ-99", "testCaseKeys": ["PROJ-100", "PROJ-101"] },
    "googleDoc": { "url": "https://docs.google.com/...", "docId": "xxxx" },
    "downloads": {
      "markdown": "/api/export/markdown?session=UUID",
      "csv": "/api/export/csv?session=UUID",
      "xlsx": "/api/export/xlsx?session=UUID",
      "json": "/api/export/json?session=UUID"
    }
  },
  "engineUsed": "gemini-3.8-flash",
  "temperature": 0.2,
  "tokensUsed": 1540
}
```

### 4.5 JIRA Connection Test Schema
```json
// GET /api/jira/test-connection
{
  "success": true,
  "user": "John Doe (john@example.com)",
  "baseUrl": "https://your-org.atlassian.net",
  "projectKey": "PROJ",
  "projectName": "My Project"
}
```

## 5. Behavioral Rules

### 5.1 Discovery-Confirmed Rules (Phase 0 — Locked)
| Rule | Decision |
|------|----------|
| **North Star** | JIRA stories/epics → AI generates Test Plan + Test Cases → export to JIRA + Google Docs |
| **AI Strictness** | Temperature **0.2** (near-deterministic). Generate ONLY from provided data. Zero hallucination. |
| **Missing AC** | Flag with `"warning": "Acceptance Criteria missing — cannot generate reliable test cases"`. Do NOT invent steps. |
| **Source of Truth** | JIRA Epics + Stories + Acceptance Criteria fields ONLY. No external inference. |
| **Export Formats** | In-app UI view + Download Markdown + Download **CSV** + Download **XLSX** + Push to JIRA + Push to Google Docs |
| **Integrations** | JIRA REST API v3 (required) · Gemini API `gemini-3.8-flash` (required) · Google Docs API v1 (optional) |

### 5.2 System Behavioral Rules
- **Structured Output Only:** The AI MUST respond with valid JSON matching the TestPlan and TestCase schemas. Use Gemini's `responseMimeType: "application/json"` to enforce this.
- **Low Temperature:** Always call Gemini with `temperature: 0.2`. Never raise above `0.3`.
- **Single Source of Truth:** Test case steps must be derived ONLY from the JIRA issue data provided in the prompt. If AC is missing, halt test case generation for that story and flag it.
- **Idempotent Exports:** Before creating a JIRA test issue, check if a linked test with the same summary already exists to avoid duplicates.
- **Google Docs is Optional:** If no Google credentials are configured, skip gracefully without crashing.
- **Token Efficiency:** Batch multiple stories into a single Gemini call when generating test cases. Max 10 stories per batch.
- **Model:** Always use `gemini-3.8-flash`. Never use deprecated `gemini-2.x` or `gemini-1.5-x` models.
- **CSV/XLSX Export:** Test Cases table must be exportable as `.csv` and `.xlsx` (using `exceljs` library).

## 6. API Keys & Security Rules
- All API keys stored ONLY in `.env` — never hardcoded.
- `.env` is in `.gitignore`.
- JIRA API Token uses HTTP Basic Auth: `base64(email:token)`.
- Google OAuth2 tokens stored in `.tmp/google_tokens.json` (gitignored).

## 7. Maintenance & Error Log
- `2026-11-08`: Project initialized under B.L.A.S.T. Protocol 0 — gemini.md, task_plan.md, findings.md, progress.md created.
