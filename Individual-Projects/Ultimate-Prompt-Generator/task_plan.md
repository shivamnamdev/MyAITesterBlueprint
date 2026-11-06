# Task Plan: Ultimate Prompt Generator Web Tool (B.L.A.S.T.)

## Phase 0: Initialization (Protocol 0)
- [x] Create project memory files (`task_plan.md`, `findings.md`, `progress.md`)
- [x] Create project constitution (`gemini.md`)
- [x] Formulate master markdown specification (`ULTIMATE_PROMPT_FRAMEWORK.md`)
- [x] Establish Data Schemas (`PromptGeneratorRequest`, `PromptGeneratorResponse`)

## Phase 1: B - Blueprint (Vision & Logic)
- [x] Analyze `Generator-Prompt.txt` (10 principles, 17 structural sections, 7 roles)
- [x] Define input/output payloads and presets matrix
- [x] Create Layer 1 technical SOP in `architecture/sop_prompt_generation.md`

## Phase 2: L - Link (Connectivity)
- [x] Implement `tools/llm_client.py` with Ollama & Gemini connectivity checks
- [x] Implement graceful fallback to deterministic engine when offline

## Phase 3: A - Architect (The 3-Layer Build)
- [x] Build Layer 3 deterministic engine `tools/prompt_compiler.py` with 17-section assembler
- [x] Build Flask Web Application `app.py` with REST endpoints (`/api/generate`, `/api/presets`, `/api/health`)
- [x] Implement input validation, section filtering, and clarifying question detection

## Phase 4: S - Stylize (Refinement & UI)
- [x] Develop responsive, modern Web UI (`templates/index.html`)
  - Dark/Light aesthetic, Tailwind-inspired layout
  - One-click presets (QA Automation, DevOps, Senior Backend, Product Manager, etc.)
  - Interactive section selector toggles (enable/disable any of the 17 sections)
  - Live preview with rendered Markdown and raw prompt view
  - Copy to clipboard with toast notification
  - Download as Markdown (`.md`) and Text (`.txt`)
  - Clarification suggestions banner

## Phase 5: T - Trigger (Deployment & Verification)
- [x] Create executable startup script `start.sh` and `requirements.txt`
- [x] Test deterministic prompt generation and API endpoints
- [x] Verify test suite and error handling (`tests/test_app.py`)
- [x] Update repository master execution guide: `EXECUTION_STEPS.md`
- [x] Finalize maintenance log in `gemini.md` and `progress.md`
