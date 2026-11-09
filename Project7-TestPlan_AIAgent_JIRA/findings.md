# 🔍 Findings: Test Plan & Test Cases AI Agent

> Research, discoveries, constraints, and API notes.

---

## JIRA REST API v3

- **Base URL:** `https://your-org.atlassian.net`
- **Auth:** HTTP Basic — `Authorization: Basic base64(email:apiToken)`
- **API Token:** Generate at https://id.atlassian.com/manage-profile/security/api-tokens
- **Useful Endpoints:**
  - `GET /rest/api/3/myself` — Verify credentials
  - `GET /rest/api/3/project/{projectKey}` — Project metadata
  - `GET /rest/api/3/search?jql=project=PROJ AND issuetype=Story` — Fetch stories by JQL
  - `GET /rest/api/3/issue/{issueKey}` — Single issue with full fields
  - `POST /rest/api/3/issue` — Create a new issue (Test Case / Test Plan)
- **Acceptance Criteria:** Often stored in `customfield_10016` (story points field varies by instance). The standard AC field key may differ — discovery required per workspace.
- **Description Format:** JIRA API v3 returns description as Atlassian Document Format (ADF JSON) — must be converted to plain text before sending to Gemini.
- **Rate Limits:** 300 requests/minute for Atlassian Cloud REST API.

---

## Gemini API (google-genai SDK ≥ 2.30.1)

- **SDK:** `google-genai` (NOT the deprecated `google-generativeai`)
- **Install:** `npm install @google/genai`
- **Model:** `gemini-3.8-flash` — fast, balanced, 1M token context
- **Structured Output:** Use `responseMimeType: "application/json"` + `responseSchema` to enforce JSON output matching TestPlan/TestCase schemas.
- **System Instruction:** Use `system_instruction` parameter for role setting (QA Expert persona).
- **Interaction API:** Use `client.models.generateContent` for single-turn generation.
- **Token limits:** 1M input / 8K output — very generous for batching multiple stories.
- **Cost:** Pay-per-token; `gemini-3.8-flash` is cost-efficient for agentic tasks.

---

## Google Docs API v1

- **Auth:** OAuth2 (google-auth-library) or Service Account
- **Scopes needed:** `https://www.googleapis.com/auth/documents`, `https://www.googleapis.com/auth/drive.file`
- **Create Doc:** `POST https://docs.googleapis.com/v1/documents` with `{ title: "Test Plan..." }`
- **Append Content:** `POST /v1/documents/{documentId}:batchUpdate` with `insertText` or `insertTable` requests
- **OAuth2 Flow:** Redirect user to Google consent screen → callback with `code` → exchange for tokens → store in `.tmp/google_tokens.json`
- **Complexity:** Medium — formatting rich test tables requires multiple `batchUpdate` requests. Keep initial implementation as plain text sections.

---

## Anthropic Claude API (@anthropic-ai/sdk)

- **Default Cloud Suite:**
  - `claude-3-7-sonnet-20250219`: Latest hybrid reasoning model (optimal for complex logic and edge cases).
  - `claude-3-5-sonnet-20241022`: High accuracy QA generation.
  - `claude-3-opus-20240229`: Deep analysis of legacy and large architectures.
  - `claude-3-5-haiku-20241022`: Ultra-fast and economical.
- **Authentication:** `x-api-key: sk-ant-...` obtained directly from `https://console.anthropic.com/settings/keys`.
- **System Instruction:** Embedded in `system` parameter of `client.messages.create()`.
- **Temperature:** Hard-locked to `0.2` for deterministic QA output.

---

## JIRA 401 & 404 Troubleshooting Discoveries

- **401 Unauthorized:**
  - Atlassian Cloud rejects account passwords. Requires API tokens from `https://id.atlassian.com/manage-profile/security/api-tokens`.
  - The email supplied in `Authorization: Basic base64(email:token)` must strictly match the primary email of the token owner.
  - If using Jira Server/Data Center with Personal Access Tokens (PAT), use `Authorization: Bearer <PAT>` without email.
- **404 Not Found:**
  - JIRA issue keys must follow `PROJECTKEY-NUMBER` (e.g. `PROJ-101`), not just the issue number `101`.
  - If a user pastes a full issue URL (e.g. `https://my-org.atlassian.net/browse/PROJ-101`), regex extraction must parse out `PROJ-101`.
  - JIRA Cloud root URL must strip `/jira`, `/browse`, or `/software/projects` paths.
  - Dual fallback: try REST API v3 first (`/rest/api/3/issue/...`), then automatically fall back to REST API v2 (`/rest/api/2/issue/...`).

---

## Constraints & Decisions

| Constraint | Decision |
|-----------|----------|
| JIRA ADF description format | Strip to plain text using recursive ADF parser |
| AC custom field varies by workspace | Allow user to configure `JIRA_AC_FIELD` in `.env` or auto-detect |
| Gemini hallucination risk | Use `responseMimeType: "application/json"` + explicit schema in prompt |
| Google Docs complexity | Phase 1: Markdown export only. Phase 2: Google Docs API |
| Duplicate JIRA test issues | Query before create; skip if matching title exists |
| Token efficiency | Batch ≤10 stories per Gemini call |

---

## Resources
- JIRA REST API v3 docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- Gemini API docs: https://ai.google.dev/api
- google-genai SDK: https://www.npmjs.com/package/@google/genai
- Google Docs API: https://developers.google.com/docs/api/reference/rest
- ADF → plain text reference: https://developer.atlassian.com/cloud/jira/platform/apis/document/
