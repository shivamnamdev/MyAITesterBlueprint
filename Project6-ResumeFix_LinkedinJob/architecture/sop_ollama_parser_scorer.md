# SOP: Ollama Parser, Web Scraper, and Resume Scorer

## 1. Objective
Define the protocol for extracting job details from unstructured text or URLs, and evaluating candidate resumes against job descriptions with a 1-10 rating and prospect bar.

## 2. Web Scraper Protocol
- Endpoint accepts `{ url: string }`.
- Scraper fetches the webpage via native `fetch` / `axios` with standard browser user-agent headers.
- Strips `<script>`, `<style>`, navigation bars, and footer clutter.
- Extracts main text (titles, headings, paragraphs, bullet points).
- Returns cleaned text payload ready for LLM or heuristic entity extraction.

## 3. Entity Extraction Protocol (Smart Parse)
- Input: `rawText` (from paste or web scraper).
- **Ollama Pipeline**:
  - Prompt: Extract structured JSON `{ jobTitle, company, location, salaryRange, sourceReceived, platformApplied, jdText, contactPerson }`.
  - Target model: `llama3.2` or configurable via `OLLAMA_MODEL` environment variable.
  - Endpoint: `POST http://localhost:11434/api/generate` with `format: "json"`.
- **Heuristic Fallback Pipeline (if Ollama offline/unresponsive within 5s)**:
  - Regex detection for company patterns (e.g. `at [Company]`, `Company: [Company]`).
  - Regex detection for salary formats (`$\d{2,3}[kK]`, `$\d{2,3},\d{3}`).
  - Job title matching against common tech titles (QA Engineer, SDET, Frontend, Backend, Full Stack, DevOps, etc.).
  - Returns best-effort structured JSON with `engineUsed: "rule-based-fallback"`.

## 4. Resume-to-JD Match & Prospect Assessment Protocol
- Input: `jdText`, `resumeText`, `jobTitle`, `company`.
- **Evaluation Criteria**:
  1. Technical Skills Alignment (4.0 points)
  2. Experience Level & Responsibilities Alignment (3.0 points)
  3. Domain Knowledge & Tooling Overlap (2.0 points)
  4. Role Fit & Keyword Density (1.0 points)
  - Total: Out of 10.0 points.
- **Output Metrics**:
  - `ratingOutOfTen`: Float (e.g., 8.5)
  - `percentage`: Integer (e.g., 85%)
  - `ratingLabel`:
    - `>= 8.0`: "High Prospect / Top Candidate" (Green)
    - `6.0 - 7.9`: "Moderate Prospect / Good Fit" (Amber)
    - `< 6.0`: "Low Match / Needs Heavy Tailoring" (Red)
  - `strengths`: Top 3-5 matching capabilities.
  - `gaps`: Missing keywords or unmatched requirements.
  - `tailoringTips`: 2-3 actionable resume bullet tweaks.

