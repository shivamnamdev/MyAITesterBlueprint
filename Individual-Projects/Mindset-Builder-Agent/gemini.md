# 📜 Mindset Builder Agent - Project Constitution (`gemini.md`)

This document is the absolute **Source of Truth** for the Mindset Builder Agent. No code shall violate these rules or schemas.

---

## 1. Discovery Blueprint Alignment

- **North Star:** Transform any domain, role, or subject into an internalized, elite expert mindset through structured domain intelligence, tri-tier cognitive analogies (Easy, Medium, Hard), and interactive Socratic chapter teaching.
- **Integrations:**
  - Google Gemini API (`GEMINI_API_KEY`)
  - Local Ollama (`OLLAMA_HOST`, `OLLAMA_MODEL`)
  - Deterministic Expert Engine (offline fallback with deep curriculum generation for any domain)
- **Source of Truth:** User-selected domain, standardized industry certification syllabi (e.g., ISTQB for QA, AWS/CKA for DevOps, CISSP for Security, etc.), and first-principles mental models.
- **Delivery Payload:** High-fidelity interactive Chatbot Web UI (Gemini/ChatGPT styled with flowing neural network background), downloadable Markdown Mindset Dossier, and interactive scenario drill feedback.
- **Behavioral Rules:**
  - Focus strictly on *mindset and cognitive frameworks* (how to think, diagnose, and decide), NOT just mechanical coding/syntax tutorials.
  - Always ground teachings in the selected analogy to wire intuitive understanding.
  - Provide interactive diagnostic drills where the user is challenged with real-world dilemmas.

---

## 2. Core JSON Data Schemas

### 2.1 Domain Intelligence Schema (`domain_intelligence`)
```json
{
  "domain": "Quality Assurance & Software Testing",
  "category": "Engineering & Reliability",
  "first_principles": [
    "Testing never proves the absence of defects, only their presence.",
    "Quality is value to some person who matters."
  ],
  "syllabi_and_standards": [
    "ISTQB Certified Tester Foundation & Advanced Level",
    "ISO/IEC/IEEE 29119 Software Testing Standards",
    "Context-Driven Testing & Rapid Software Testing (Bach & Bolton)"
  ],
  "expert_vs_novice_mindset": {
    "novice": "Believes their job is to click through scripts and declare software bug-free.",
    "expert": "Operates as an empirical investigator challenging assumptions and illuminating hidden risks under uncertainty."
  },
  "core_cognitive_heuristics": [
    "Boundary Value Skepticism",
    "Root-Cause Epidemiology over Symptom Patching",
    "Empirical Verification vs Blind Validation"
  ]
}
```

### 2.2 Tri-Tier Analogy Schema (`analogies_payload`)
```json
{
  "easy": {
    "title": "The Personal Diagnostic Doctor",
    "tier": "Easy / Intuitive",
    "tagline": "Preventative medicine, symptom triage, and physiological health checks.",
    "description": "Just as a physician performs regular checkups, investigates complaints, and diagnoses underlying systemic illness rather than just prescribing painkillers, a QA engineer tests for systemic stability, uncovers regressions, and isolates root causes before symptoms crash the organism.",
    "mapping": [
      {"domain_concept": "Regression Testing", "analogy_counterpart": "Routine annual health checkup on vital organs"},
      {"domain_concept": "Bug Reporting & Triage", "analogy_counterpart": "Documenting symptoms, lab bloodwork, and medical history for surgery"},
      {"domain_concept": "Test Case Planning", "analogy_counterpart": "Designing targeted diagnostic stress tests for specific organ risks"}
    ]
  },
  "medium": {
    "title": "The Airport Air Traffic Controller & Safety Inspector",
    "tier": "Medium / Systemic",
    "tagline": "Continuous flow monitoring, pre-flight checklists, and fail-safe protocols.",
    "description": "An Air Traffic Controller and FAA inspector coordinate complex interdependent flights under variable weather, ensuring zero collisions and rigorous pre-flight tolerances.",
    "mapping": [
      {"domain_concept": "Release Readiness", "analogy_counterpart": "Final clearance for passenger plane takeoff in bad weather"},
      {"domain_concept": "Continuous Integration Testing", "analogy_counterpart": "Real-time radar transponder beacons tracking flight path alignment"}
    ]
  },
  "hard": {
    "title": "The Popperian Falsificationist & Epistemological Skeptic",
    "tier": "Hard / First-Principles Philosophy",
    "tagline": "Conjectures, refutations, and systematic destruction of flawed assumptions.",
    "description": "Based on Karl Popper's philosophy of science: no amount of confirming experiments can prove a theory true, but a single counterexample shatters it. The mindset is relentless stress-testing of fragile epistemic axioms.",
    "mapping": [
      {"domain_concept": "Passing Test Case", "analogy_counterpart": "A hypothesis that has survived today's falsification attempt, yet remains provisional"},
      {"domain_concept": "Edge Case Boundary Testing", "analogy_counterpart": "Exposing the hypothesis to extreme conditions where current theory is most prone to breakdown"}
    ]
  }
}
```

### 2.3 Curriculum Chapter Schema (`chapter_curriculum`)
```json
{
  "chapter_id": 1,
  "title": "Chapter 1: The Perceptual Lens - How the Mind Sees Reality",
  "analogy_anchor": "The Personal Diagnostic Doctor",
  "concept_breakdown": "Explanation of how experts in this field perceive problems compared to novices.",
  "analogy_immersion": "Detailed translation connecting the analogy to daily high-performance decision making.",
  "mental_model_rule": "The Golden Axiom for this chapter.",
  "scenario_drill": {
    "situation": "A realistic high-stakes scenario confronting the professional.",
    "challenge": "What decision do you make and why?",
    "options": [
      {
        "id": "A",
        "action": "Description of action A",
        "mindset_alignment": "Novice / Procedural",
        "feedback": "Why this reflects mechanical skill rather than master mindset."
      },
      {
        "id": "B",
        "action": "Description of action B",
        "mindset_alignment": "Master / First-Principles",
        "feedback": "Why an elite practitioner with the true mindset chooses this."
      }
    ]
  }
}
```

---

## 3. Architectural Invariants

1. **Separation of Concerns:**
   - `architecture/`: Markdown Standard Operating Procedures (SOPs).
   - `tools/`: Deterministic, atomic execution scripts.
   - `templates/` & `static/`: High-performance, responsive UI with flowing neural canvas.
2. **Provider Resilience:**
   - If an API key is absent or network fails, the system automatically runs the deterministic Mindset Synthesis Engine with rich domain intelligence for any field, ensuring 100% uptime.
3. **Responsive Visual Experience:**
   - Neural network canvas adapts to device pixel ratio and window resize.
   - Nodes pulse when the agent is "thinking" or transmitting mindset impulses.

