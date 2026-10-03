# Findings & Discoveries - Local LLM Testcase Generator

## Research & Environment
- **Architecture**: B.L.A.S.T. protocol (Blueprint, Link, Architect, Stylize, Trigger) & A.N.T. 3-layer architecture.
- **Engine**: Ollama (local LLM runtime).
- **Goal**: Generate high-quality test cases based on user-provided requirements and custom testcase generation prompts.

## Key Constraints & Observations
- Ollama CLI is installed (`/usr/local/bin/ollama`).
- Background task is pulling `llama3.2` model.
- Must remain deterministic, reliable, and adhere strictly to defined schemas.

## Technical Research & Architecture Decisions
1. **Ollama API Structured JSON Output**:
   - Ollama native API supports `"format": "json"` in `POST http://localhost:11434/api/generate` or `/api/chat`.
   - System prompt instructions explicitly enforce strict JSON key structures.
2. **Master System Prompt Strategy**:
   - The master system prompt will instruct `llama3.2` to function strictly as a Senior QA Automation Engineer.
   - Outputs: `feature_name`, `summary`, and an array of `test_cases` (containing `id`, `title`, `type`, `priority`, `preconditions`, `steps`, `expected_result`).
3. **Application Architecture**:
   - **Backend**: Lightweight Node.js/Express server (or Python backend) serving static UI assets and proxying requests to local Ollama API.
   - **Frontend**: Premium Web Chat Interface allowing users to type feature prompts, choose test types, view formatted testcase cards/tables, and copy/export to JSON or Markdown.


