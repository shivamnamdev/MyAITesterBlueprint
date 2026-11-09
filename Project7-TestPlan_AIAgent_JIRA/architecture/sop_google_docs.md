# 📖 SOP: Google Docs API v1 Document Generation

## 1. Objective
Enable export of generated Test Plans and Test Cases directly into a formatted Google Doc using the Google Docs & Drive APIs (`googleapis`).

## 2. Authentication Pattern
- **OAuth2 Flow:**
  - Scopes:
    - `https://www.googleapis.com/auth/documents`
    - `https://www.googleapis.com/auth/drive.file`
  - Client ID & Client Secret stored in `.env` (or configured via environment).
  - Tokens stored in `.tmp/google_tokens.json` (gitignored).

## 3. Document Creation Protocol
1. **Initialize:** Call Google Docs API `documents.create` with title `[Test Plan] {ticketKey}: {title}`.
2. **Batch Update Structure:**
   - Execute `documents.batchUpdate` with structural text inserts:
     - Header / Title with styling
     - Scope and Objectives
     - Test Strategy (Environments, Entry/Exit criteria)
     - Test Cases section with step-by-step tables
3. **Drive Organization (Optional):**
   - If `GOOGLE_DRIVE_FOLDER_ID` is set, move document into target folder via Drive API `files.update`.
4. **Output:** Return public view/edit URL (`https://docs.google.com/document/d/{docId}/edit`).

## 4. Graceful Fallback
- If Google credentials are not configured, the system logs an informational notice and allows instant download via Excel (`.xlsx`), CSV, and Markdown without failing the generation process.
