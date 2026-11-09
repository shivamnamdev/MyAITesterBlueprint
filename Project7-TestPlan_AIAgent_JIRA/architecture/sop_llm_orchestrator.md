# 📖 SOP: Multi-LLM Orchestrator (Anthropic Claude, Ollama, Gemini)

## 1. Objective
Enforce strict, deterministic, high-coverage Test Plan and Test Case generation using user-selected LLMs with temperature locked at `0.2` and single-source-of-truth compliance.

## 2. Supported LLM Matrix
| Provider | Model Identifier | Tier | Best Use Case |
|---|---|---|---|
| Anthropic | `claude-3-7-sonnet-20250219` | Cloud (Recommended) | Complex business flows, edge cases |
| Anthropic | `claude-3-5-sonnet-20241022` | Cloud | High reasoning & step-by-step clarity |
| Anthropic | `claude-3-opus-20240229` | Cloud | Deep legacy system analysis |
| Anthropic | `claude-3-5-haiku-20241022` | Cloud | Ultra fast, cost-efficient testing |
| Ollama | `llama3.2`, `codellama`, etc. | Local Offline | Zero data leaves the local machine |
| Gemini | `gemini-3.8-flash` | Cloud | Balanced multimodal generation |

## 3. Two-Stage Human-in-the-Loop Lifecycle

### Stage 1: Test Plan Generation (`/api/generate/plan`)
- **Inputs:** JIRA ticket metadata (summary, description, acceptance criteria) + optional uploaded supplemental specifications (Microsoft Word `.docx` / `.doc`, PDF, Markdown, Swagger/OpenAPI, wireframe notes).
- **Behavior:** Prompts the selected LLM to produce **only** the strategic `testPlan` object (Scope, Objectives, Test Types, Target Environments, Entry/Exit criteria, and Risk Mitigations).
- **Integrity Rule:** If Acceptance Criteria is missing and no supplemental spec is provided, populate the `warning` field alerting the QA lead.
- **Approval Gate:** The Test Plan is rendered in the UI with a status of **Draft (Review Required)**. The user can review the scope and strategy, and must click **"Approve Test Plan"** before proceeding.

### Stage 2: Step-by-Step Test Cases Generation (`/api/generate/cases`)
- **Gate:** Locked and disabled until the user explicitly approves the Test Plan in Stage 1.
- **Inputs:** JIRA ticket details + supplemental specifications + **User-Approved Test Plan**.
- **Behavior:** Prompts the selected LLM to generate granular, high-coverage step-by-step test cases strictly aligned with the approved scope and strategy.
- **Output:** Array of test cases containing ID, Title, Type, Priority, Preconditions, step-by-step Actions, Test Data, Expected Results, and Postconditions.

## 4. Strict Execution Invariants
- **Temperature: 0.2** — Do not increase. Ensures reproducible, deterministic QA output.
- **Single Source of Truth:** Only test what is defined in the JIRA ticket and verified uploaded supplemental documents.
- **Output Validation:** Parse response strictly as JSON; strip any markdown fences before returning to the UI.

