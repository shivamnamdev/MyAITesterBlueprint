# 🧠 SOP 01: Domain Intelligence & Syllabus Ingestion

## 1. Purpose
Extract and synthesize the first principles, formal certification syllabi, industry standards, and cognitive heuristics for ANY user-specified domain (e.g. QA Engineering, DevOps, Cybersecurity, Product Management, Machine Learning Architecture, Medicine, Law, Financial Risk, etc.).

## 2. Ingestion Framework
When a user provides a subject or field:
1. **Identify the Industry Source of Truth:**
   - Map to top international certifying bodies and recognized knowledge bases (e.g., ISTQB / IEEE for QA; TOGAF for Enterprise Architecture; AWS/CNCF for Cloud/DevOps; CISSP/OSCP for Security; CFA for Finance; etc.).
2. **Deconstruct Skill vs. Mindset:**
   - **Mechanical Skill (Procedural):** "How to click X, write syntax Y, run tool Z."
   - **Mindset (Epistemic / Intuitive):** "How to formulate hypotheses, assess hidden risk, balance trade-offs under high ambiguity, and spot anomalies that automated checks miss."
3. **Contrast Novice vs. Elite Mindset:**
   - Document explicitly where the common trap lies (e.g., novices focus on green checkmarks; masters focus on testing assumptions and boundary falsification).
4. **Identify Foundational Heuristics:**
   - Minimum of 3 golden heuristics that guide an elite practitioner's daily decisions.

## 3. Output Requirements
Produce a deterministic `domain_intelligence` payload conforming to `gemini.md`.

