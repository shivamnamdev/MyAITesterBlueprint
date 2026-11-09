# 📖 SOP: JIRA REST API v3 Integration

## 1. Objective
Deterministic extraction of JIRA project issues (Epics, Stories, Bugs) and Acceptance Criteria with safe Atlassian Document Format (ADF) translation to plain text, and bidirectional test case issue creation.

## 2. Authentication Pattern
- **Method:** HTTP Basic Authentication using `base64(email:apiToken)`
- **Header:** `Authorization: Basic <token>`
- **Source:** Dynamically received via UI payload (cached in client `localStorage`) or loaded from `.env`.

## 3. Extraction Protocol
1. User provides JIRA Base URL (e.g. `https://my-company.atlassian.net`), Email, and API Token.
2. The agent executes `GET /rest/api/3/myself` to verify user validity and read display name.
3. User specifies Ticket ID (e.g. `PROJ-101`).
4. The agent queries `GET /rest/api/3/issue/{ticketKey}?expand=renderedFields,names,schema`.
5. **ADF Parsing Engine:** Recursively extracts paragraphs, bullet lists, numbered lists, headings, and code blocks into readable plain text.
6. **Acceptance Criteria Detection:**
   - Scans custom fields (`customfield_*`) for keywords like Given/When/Then, Scenario, Criteria.
   - Fallback: Regex scan across description text for `Acceptance Criteria:`, `AC:`, etc.
   - If not found: Flags `hasAcceptanceCriteria: false` for the downstream AI prompt.

## 4. Write-back Protocol (Optional)
- Creates `[Test] <Title>` Task/Test issue linked via `issueLink` (relationship `Relates`) back to the parent ticket.

