# Technical SOP: Local LLM Test Case Generator

## 1. Objective
Generate structured, deterministic QA test cases for web applications and API features using local LLM runtime (Ollama with `llama3.2`).

## 2. Inputs & Data Schema
- **Target Feature Description**: Detailed user requirement string (e.g. `app.vwo.com` login page with email, password, "remember me", error messages, and dashboard navigation).
- **Test Scope Focus**: `All`, `Functional`, `Negative`, `Security`, `UI/UX`, `Edge Cases`.
- **Model**: `llama3.2`.

## 3. Workflow & Tool Execution Logic
1. **Receive Request**: Express API endpoint `POST /api/generate` or CLI tool `tools/generate_testcases.js`.
2. **System Prompt Formulation**: Build structured prompt enforcing raw JSON output conforming to schema in `gemini.md`.
3. **LLM Generation**: Dispatch POST request to `http://127.0.0.1:11434/api/generate` with `"format": "json"`.
4. **JSON Parsing & Repair**: Sanitize markdown code block wrappers if any, parse JSON, validate array structure.
5. **Payload Delivery**: Deliver JSON response to UI or CLI output.

## 4. Edge Cases & Error Handling
- **Ollama Offline**: Fallback with clear error message indicating Ollama daemon status.
- **Malformed JSON Output**: Repair function cleans leading/trailing noise before throwing structured parse error.
- **Invalid Credentials Error Case Handling**: Specific negative tests generated for error message `"you have entered an invalid [credentials]"`.
