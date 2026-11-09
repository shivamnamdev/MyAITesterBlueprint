# 🧠 Mindset Builder Agent - Task Plan

## Goal
Build a state-of-the-art **Mindset Builder Agent** web portal featuring a Gemini/ChatGPT-style chatbot interface with an interactive flowing neural network background. The agent deconstructs any domain/field entered by the user, synthesizes expert-level domain & certification intelligence, crafts 3 graded analogies (Easy, Medium, Hard), and conducts interactive chapter-by-chapter pedagogical coaching to instill the cognitive models and intuition of a world-class practitioner.

---

## Phases & Checklists

### Phase 0: Initialization (Protocol 0)
- [x] Create project memory files (`task_plan.md`, `findings.md`, `progress.md`)
- [x] Create project constitution & data schemas (`gemini.md`)
- [x] Align on Discovery Questions (North Star, Integrations, Source of Truth, Delivery Payload, Behavioral Rules)

### Phase 1: B - Blueprint
- [x] Define multi-tier Mindset Induction engine architecture
- [x] Define JSON Data Schemas for:
  - Domain Intelligence & Syllabus Ingestion
  - Tri-Tier Analogy Generation (Easy, Medium, Deep/Hard)
  - Chapter-wise Curriculum & Interactive Drill Scenarios
  - Chat Turn Interaction & Mindset Diagnostic Evaluations
- [x] Confirm backend (Python Flask + REST/Stream API) + Frontend (Modern Chatbot UI + Flowing Neural Net Canvas + KaTeX / Markdown parsing + Interactive Mindset Journey)

### Phase 2: L - Link (Connectivity & Environment)
- [x] Create `requirements.txt` with Flask, requests, python-dotenv, markdown
- [x] Create `.env.example` supporting Google Gemini API (`GEMINI_API_KEY`), local Ollama (`OLLAMA_HOST`, `OLLAMA_MODEL`), and zero-dependency deterministic heuristic fallback
- [x] Build link verification script in `tools/verify_env.py`

### Phase 3: A - Architect (The 3-Layer Build)
- [x] **Layer 1: Architecture (`architecture/`)**
  - `architecture/domain_intelligence_sop.md`: Rules for extracting first principles, certification syllabi, and expert intuition
  - `architecture/analogy_engine_sop.md`: Framework for constructing 3-tier intuitive bridges (Easy, Medium, Deep)
  - `architecture/curriculum_pedagogy_sop.md`: Rules for Socratic, analogy-driven, scenario-tested chapter coaching
- [x] **Layer 2: Navigation & Orchestration**
  - `tools/orchestrator.py`: Multi-stage pipeline controller linking Domain Analysis -> Analogy Selection -> Curriculum Delivery -> Real-time Chat
- [x] **Layer 3: Tools (`tools/`)**
  - `tools/domain_analyzer.py`: Ingests field, retrieves/synthesizes syllabus, key heuristics, and mental models
  - `tools/analogy_engine.py`: Crafts 3 multi-level analogies with cognitive mapping tables
  - `tools/curriculum_generator.py`: Generates 5-chapter pedagogical curriculum with practical scenario drills
  - `tools/llm_client.py`: Multi-provider LLM gateway (Gemini API, Local Ollama, and Built-in Expert Mindset Engine)

### Phase 4: S - Stylize (Gemini/ChatGPT Chatbot UI & Neural Canvas)
- [x] Design high-end chat interface in `templates/index.html` & `static/`:
  - Full-screen dynamic canvas with flowing neural network nodes, synaptic pulses, and physics-based particle connections
  - Gemini / ChatGPT sleek conversation layout with thinking indicators and streaming markdown support
  - Floating Mindset HUD / Blueprint Drawer showing active domain, selected analogy, cognitive breakdown, and progress
  - Quick-start starter pills for popular domains (QA Engineer, Site Reliability Engineer, Enterprise Architect, Product Strategist, Cybersecurity Red Teamer, Prompt Engineer)
  - Interactive Analogy Selector cards (Easy, Medium, Hard)
  - Chapter Navigator & Interactive Mindset Scenario Drills
  - Export full Mindset Dossier as Markdown or printable view

### Phase 5: T - Trigger & Verification
- [x] Build automated unit and integration tests in `tests/test_mindset_engine.py` (All 6 tests passing)
- [x] Create `start.sh` execution script for 1-click startup
- [x] Update `EXECUTION_STEPS.md` following project standards
- [x] Perform end-to-end verification and run the application

