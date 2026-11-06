# 📜 Project Constitution: Ultimate Prompt Generator Web Tool

## 1. Project Map & Core Identity
- **Goal:** Build an interactive, modern Web Tool and CLI compiler that generates production-grade, 17-section Ultimate Master Prompts based on `Generator-Prompt.txt` and the B.L.A.S.T. protocol.
- **Protocol Standard:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) with A.N.T. 3-Layer Architecture.

## 2. Architectural Invariants
- Deterministic compiler and helper utilities must reside in `tools/`.
- Technical SOPs must be maintained in `architecture/`.
- Temporary outputs, intermediate files, and draft schemas must be stored in `.tmp/`.
- The Web Tool must provide dual execution modes:
  1. **Deterministic Compiler (Offline/Instant):** Formats complete 17-section master prompts without requiring external API keys or network.
  2. **LLM Engine (Ollama / Gemini):** Connects to local Ollama (`http://localhost:11434`) or Gemini API when configured, utilizing `Generator-Prompt.txt` as the master prompt engineer instruction.
- The UI must feature copy-to-clipboard, markdown download, customizable section toggles, role selectors, and domain presets (QA Lead, Full-Stack Dev, DevOps, Data Engineer, etc.).

## 3. Data Schemas (Input / Output Shapes)

### Input Payload Schema (`PromptGeneratorRequest`)
```json
{
  "topic": "string (core domain, goal, or project name - required)",
  "category": "QA Automation | Software Engineering | AI & ML | Cloud & DevOps | Product Management | General",
  "targetRole": "string (e.g. Principal QA Architect, Staff AI Engineer)",
  "experienceLevel": "Beginner | Intermediate | Advanced | Staff / Principal",
  "techStack": ["string"],
  "timeCommitment": "string (e.g. 10 hours/week, Full-time)",
  "constraints": "string (budget, hardware, regulatory, 'Do Not' rules)",
  "targetModel": "ChatGPT (GPT-4o) | Claude 3.5 Sonnet | Google Gemini | Local Ollama | General LLM",
  "activeSections": [
    "role_identity",
    "mission_objectives",
    "user_background",
    "core_principles",
    "knowledge_coverage",
    "research_standards",
    "diagnostic_assessment",
    "strategic_roadmap",
    "execution_methodology",
    "practical_exercises",
    "tools_technologies",
    "evaluation_metrics",
    "risk_management",
    "advanced_optimization",
    "continuous_maintenance",
    "communication_protocols",
    "kickoff_step"
  ],
  "engine": "deterministic | ollama | gemini",
  "ollamaModel": "string (default: llama3.2)"
}
```

### Output Payload Schema (`PromptGeneratorResponse`)
```json
{
  "status": "success | error",
  "title": "string (Meaningful title for the master prompt)",
  "generatedPrompt": "string (Complete, copy-ready Markdown prompt)",
  "metadata": {
    "engineUsed": "deterministic | ollama | gemini",
    "sectionCount": 17,
    "wordCount": 1450,
    "charCount": 9820,
    "generatedAt": "ISO-8601 Timestamp"
  },
  "clarifyingQuestion": "string | null (Targeted question if details are missing)",
  "error": "string | null"
}
```

## 4. Behavioral Rules
- Never generate truncated or superficial prompts with placeholder comments (`// fill in later`).
- Preserve all 10 Prompt Engineering Principles defined in `Generator-Prompt.txt`.
- Support graceful fallback to the Deterministic Engine if Ollama is unreachable.
- Deliver responsive, sleek dark-mode UI with instant copy and export.

## 5. Maintenance & Error Log
- `2026-11-03`: Initialized constitution, schemas, and architecture.

