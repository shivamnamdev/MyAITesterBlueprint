# Task Plan: Selenium Java to Playwright TS Converter (Ollama LLM)

## Phase 0: Initialization (Protocol 0)
- [x] Create project memory files (`task_plan.md`, `findings.md`, `progress.md`)
- [x] Create project constitution (`gemini.md`)
- [x] Present Discovery Questions to user

## Phase 1: B - Blueprint (Vision & Logic)
- [x] Answer Discovery Questions (Stack: Playwright TS, Engine: Local Ollama API, Input: File or Folder)
- [x] Define JSON Data Schemas (`ConversionRequest` & `ConversionResult`) in `gemini.md`
- [x] Finalize Blueprint & Protocol rules

## Phase 2: L - Link (Connectivity)
- [x] Check local Ollama API status (`http://localhost:11434/api/tags`)
- [x] Test Ollama API connection & model generation handshake (`tools/check_ollama.py` passed with `codellama:latest`)

## Phase 3: A - Architect (The 3-Layer Build)
- [x] Create technical SOPs in `architecture/`
  - `architecture/sop_selenium_mapping.md` (Selenium -> Playwright syntax & locator mapping rulebook)
  - `architecture/sop_conversion_pipeline.md` (Workflow logic & LLM prompt strategy)
- [x] Build deterministic tools in `tools/`
  - `tools/java_parser.py` (AST/Regex structure scanner for Java classes, methods, locators, imports)
  - `tools/ollama_client.py` (Local Ollama API wrapper for structured prompt conversion)
  - `tools/converter_cli.py` (CLI runner for single file or project directory processing)

## Phase 4: S - Stylize (Refinement & Code Validation)
- [x] Structure output Playwright TS files into modular directories (`pages/`, `tests/`, `utils/`)
- [x] Format output TypeScript files and clean code wrappers

## Phase 5: T - Trigger (Deployment & Maintenance)
- [x] Package CLI executable runner (`convert.sh`)
- [x] Create runnable Playwright TS environment (`playwright_output/package.json`, `playwright_output/playwright.config.ts`)
- [x] Execute batch conversion on `ATB4xSeleniumAdvanceFramework` project folder
- [x] Finalize maintenance log in `gemini.md`

