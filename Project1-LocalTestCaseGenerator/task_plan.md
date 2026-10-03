# Task Plan - Local LLM Testcase Generator with Ollama

## Overview
Build a local LLM-powered Testcase Generator using Ollama, following the B.L.A.S.T. protocol and A.N.T. 3-layer architecture.

## Phases & Progress
- [x] **Phase 0: Protocol 0 Initialization**
  - [x] Initialize Project Memory (`task_plan.md`, `findings.md`, `progress.md`, `gemini.md`)
- [x] **Phase 1: Architecture & Data Schema (Blueprint)**
  - [x] Define Input/Output JSON Schemas in `gemini.md`
  - [x] Pull/Verify `llama3.2` model in Ollama
- [x] **Phase 2: Core Linking & Tooling (Link)**
  - [x] Verified connection to Ollama API via `tools/test_ollama_link.js`
- [x] **Phase 3: Architect (3-Layer Build)**
  - [x] Layer 1 Architecture: Created `architecture/testcase_generator_sop.md`
  - [x] Layer 2 Navigation: API routes & system prompt formatting in `src/server.js`
  - [x] Layer 3 Tools: Created CLI tool `tools/generate_testcases.js`
- [x] **Phase 4: Stylize (Refinement & UI)**
  - [x] Web Chat UI (`src/public/`) with Glassmorphism Dark Mode & Quick Chips
  - [x] One-Click Export in JSON, Markdown, and CSV
- [x] **Phase 5: Trigger (Deployment & Automation)**
  - [x] Containerized Cloud Deployment: Created `Dockerfile`
  - [x] Automation Webhook: `POST /api/webhook/generate` & `tools/webhook_trigger.js`
  - [x] Maintenance Log & Operational Invariants in `gemini.md`




