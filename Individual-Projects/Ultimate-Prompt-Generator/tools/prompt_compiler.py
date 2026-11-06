"""Deterministic Prompt Compiler for Ultimate Prompt Generator.

Implements the 10 Prompt Engineering Principles and 17-Section Architecture
specified in Generator-Prompt.txt.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional


PRESETS: Dict[str, Dict[str, Any]] = {
    "qa_automation": {
        "title": "Principal QA Automation Architect (Playwright & CI/CD)",
        "topic": "Enterprise Web & API Test Automation Framework using Playwright TypeScript and CI/CD",
        "category": "QA Automation",
        "targetRole": "Principal QA Automation Architect & Test Infrastructure Lead",
        "experienceLevel": "Advanced",
        "techStack": ["Playwright", "TypeScript", "Node.js", "Docker", "GitHub Actions", "Allure Report", "REST APIs"],
        "timeCommitment": "10-15 hours/week",
        "constraints": "Strict Page Object Model (POM), zero hardcoded sleep waits, 100% deterministic test execution, parallel CI execution.",
        "targetModel": "ChatGPT (GPT-4o)",
    },
    "fullstack_ai": {
        "title": "Staff Full-Stack AI Engineer (Python, React & LLMs)",
        "topic": "Production AI Application with RAG, Vector Search, FastAPI backend, and Next.js frontend",
        "category": "Software Engineering",
        "targetRole": "Staff AI Engineer & Full-Stack Architect",
        "experienceLevel": "Intermediate",
        "techStack": ["Python", "FastAPI", "React / Next.js", "LangChain / LlamaIndex", "PostgreSQL (pgvector)", "Docker"],
        "timeCommitment": "12 hours/week",
        "constraints": "Strict type safety, production rate-limiting, secure token management, sub-second latency for streaming responses.",
        "targetModel": "Claude 3.5 Sonnet",
    },
    "devops_cloud": {
        "title": "Enterprise Cloud & DevOps Architect (K8s & Terraform)",
        "topic": "Multi-Region Kubernetes Infrastructure as Code on AWS/GCP with GitOps and Observability",
        "category": "Cloud & DevOps",
        "targetRole": "Lead Site Reliability Engineer & Cloud Infrastructure Architect",
        "experienceLevel": "Advanced",
        "techStack": ["Kubernetes", "Terraform", "AWS / GCP", "ArgoCD", "Prometheus / Grafana", "Helm"],
        "timeCommitment": "8 hours/week",
        "constraints": "Zero downtime deployments, immutable infrastructure, CIS compliance, strict least-privilege IAM.",
        "targetModel": "Google Gemini",
    },
    "data_engineer": {
        "title": "Principal Data Platform Engineer (BigQuery & dbt)",
        "topic": "Enterprise Modern Data Lakehouse with BigQuery, dbt Core, Airflow, and Data Quality Testing",
        "category": "Data Engineering",
        "targetRole": "Principal Data Architect & Analytics Platform Lead",
        "experienceLevel": "Advanced",
        "techStack": ["BigQuery", "dbt Core", "Apache Airflow", "Python / PySpark", "SQL", "Great Expectations"],
        "timeCommitment": "10 hours/week",
        "constraints": "Idempotent pipelines, partition/cluster optimization for cost control, strict SLA monitoring, automated data lineage.",
        "targetModel": "ChatGPT (GPT-4o)",
    },
    "product_manager": {
        "title": "Strategic AI Product Manager (Discovery to GTM)",
        "topic": "AI-First B2B SaaS Product Discovery, PRD Architecture, Unit Economics, and Go-To-Market",
        "category": "Product Management",
        "targetRole": "VP of Product & AI Product Strategist",
        "experienceLevel": "Intermediate",
        "techStack": ["PRDs", "Figma", "Mixpanel / PostHog", "SQL", "Linear / Jira", "Customer Interviewing"],
        "timeCommitment": "10 hours/week",
        "constraints": "Data-backed hypotheses, measurable OKRs, clear build-vs-buy criteria, strict privacy & GDPR compliance.",
        "targetModel": "Claude 3.5 Sonnet",
    },
}

ALL_SECTIONS = [
    ("role_identity", "1. Role & Expert Identity"),
    ("mission_objectives", "2. Mission & Long-Term Objectives"),
    ("user_background", "3. User Background & Starting Position"),
    ("core_principles", "4. Core Principles & Operating Philosophy"),
    ("knowledge_coverage", "5. Knowledge & Subject-Matter Coverage"),
    ("research_standards", "6. Research & Evidence Standards"),
    ("diagnostic_assessment", "7. Diagnostic Assessment of Current Level"),
    ("strategic_roadmap", "8. Strategic Planning & Phased Roadmap"),
    ("execution_methodology", "9. Step-by-Step Execution Methodology"),
    ("practical_exercises", "10. Practical Exercises & Real-World Projects"),
    ("tools_technologies", "11. Tools, Technologies & Environment"),
    ("evaluation_metrics", "12. Evaluation & Measurable Progress Tracking"),
    ("risk_management", "13. Risk Management & Common Pitfalls"),
    ("advanced_optimization", "14. Advanced Techniques & Optimization"),
    ("continuous_maintenance", "15. Long-Term Development & Continuous Maintenance"),
    ("communication_protocols", "16. Communication & Interaction Guidelines"),
    ("kickoff_step", "17. Initial Kick-Off Instruction (Turn 1 Trigger)"),
]


def check_clarification_needs(data: Dict[str, Any]) -> Optional[str]:
    """Check if the user request is missing essential information."""
    topic = (data.get("topic") or "").strip()
    tech_stack = data.get("techStack") or []
    experience = data.get("experienceLevel") or ""

    if len(topic) < 10:
        return "Your topic is very brief. What specific outcome, project scope, or problem domain are you aiming to solve?"
    if not tech_stack or (isinstance(tech_stack, list) and len(tech_stack) == 0):
        return f"Which specific programming languages, frameworks, or cloud platforms should we focus on for '{topic}'?"
    if not experience:
        return "What is your current technical proficiency in this subject (Beginner, Intermediate, Advanced, or Lead/Architect)?"
    return None


def generate_title(topic: str, role: str) -> str:
    """Generate an authoritative title for the Master Prompt."""
    clean_topic = topic.strip().rstrip(".")
    if len(clean_topic) > 60:
        clean_topic = clean_topic[:57] + "..."
    return f"Ultimate Master Prompt: {clean_topic} — [{role}]"


def compile_prompt(data: Dict[str, Any]) -> Dict[str, Any]:
    """Compile a deterministic 17-section Ultimate Master Prompt."""
    topic = data.get("topic", "Software Architecture and Engineering").strip()
    category = data.get("category", "General")
    target_role = data.get("targetRole", "Senior Domain Specialist & Strategic Advisor").strip()
    experience = data.get("experienceLevel", "Intermediate").strip()
    raw_stack = data.get("techStack", [])
    if isinstance(raw_stack, str):
        tech_stack = [s.strip() for s in raw_stack.split(",") if s.strip()]
    elif isinstance(raw_stack, list):
        tech_stack = [str(s).strip() for s in raw_stack if str(s).strip()]
    else:
        tech_stack = []

    stack_str = ", ".join(tech_stack) if tech_stack else "Standard Industry Tooling & Frameworks"
    time_commitment = data.get("timeCommitment", "8-10 hours/week").strip()
    constraints = data.get("constraints", "Focus on clean architecture, deterministic results, and production-readiness.").strip()
    target_model = data.get("targetModel", "ChatGPT (GPT-4o)").strip()

    active_sections = data.get("activeSections")
    if not active_sections or not isinstance(active_sections, list):
        active_sections = [sec[0] for sec in ALL_SECTIONS]

    title = generate_title(topic, target_role)
    clarifying_q = check_clarification_needs(data)

    sections_content: Dict[str, str] = {}

    # Section 1: Role & Expert Identity
    sections_content["role_identity"] = f"""## 1. Role & Expert Identity
You are an elite **{target_role}**, seasoned AI workflow architect, and technical mentor with deep subject-matter authority in **{topic}**.
You simultaneously embody:
- **Strategic Advisor:** Guiding high-level decisions, architectural trade-offs, and vision.
- **Subject-Matter Specialist:** Providing uncompromising technical depth, exact syntax, and industry standards.
- **Researcher & Analyst:** Applying empirical evidence, benchmarking, and root-cause analysis.
- **Mentor & Teacher:** Breaking down complex mechanisms into actionable mental models.
- **Implementation Partner:** Writing production-ready, testable, and robust code/specifications.
- **Critical Reviewer & QA:** Challenging fragile assumptions, detecting anti-patterns, and stress-testing solutions.
- **Continuous Growth Guide:** Ensuring sustainable learning, progressive mastery, and future-proofing.

Tone: Direct, technically precise, intellectually rigorous, pragmatic, and zero fluff."""

    # Section 2: Mission & Long-Term Objectives
    sections_content["mission_objectives"] = f"""## 2. Mission & Long-Term Objectives
Our North Star goal is:
> **"{topic}"**

### Definition of Success:
1. **Architectural Mastery:** We design and implement clean, scalable, maintainable systems that adhere to industry benchmarks.
2. **Deterministic Reliability:** Eliminate flakiness, guesswork, and brittle workarounds in all deliverables.
3. **End-to-End Competence:** Progress from conceptual clarity to fully automated, tested, and documented production assets.
4. **Autonomous Capability:** Elevate my independent problem-solving skills so I can diagnose and resolve edge cases with confidence."""

    # Section 3: User Background & Starting Position
    sections_content["user_background"] = f"""## 3. User Background & Starting Position
- **Current Proficiency:** {experience}
- **Primary Tech Stack & Tools:** {stack_str}
- **Dedicated Bandwidth:** {time_commitment}
- **Key Constraints & Boundaries:** {constraints}
- **Operating Environment:** Production-oriented, targeting execution on {target_model}.
*Calibrate all explanations to my baseline: do not waste turns explaining elementary syntax, but ensure intermediate and advanced architectural patterns are thoroughly illuminated.*"""

    # Section 4: Core Principles & Operating Philosophy
    sections_content["core_principles"] = f"""## 4. Core Principles & Operating Philosophy
Every recommendation and asset you provide must adhere to these five non-negotiables:
1. **Evidence-Based & Standard-Aligned:** Prioritize official documentation, RFC specifications, and peer-reviewed benchmarks over anecdotal blog posts.
2. **Deterministic over Probabilistic:** Design business logic and workflows to be self-healing, idempotent, and predictable.
3. **No Fluff or Superficial Placeholders:** Never emit half-finished code containing `// TODO: add logic here`. Provide functional, complete implementations with explicit error handling.
4. **Critical Thinking & Proactive Defense:** Highlight vulnerabilities, trade-offs, and scalability bottlenecks before I discover them in production.
5. **Practical Implementation:** Ground every theoretical discussion in concrete code snippets, architectural diagrams, or measurable exercises."""

    # Section 5: Knowledge & Subject-Matter Coverage
    sections_content["knowledge_coverage"] = f"""## 5. Knowledge & Subject-Matter Coverage
Systematically cover the full subject lifecycle of **{topic}**:
- **Foundations:** Core mechanics, underlying protocols, runtime behaviors, and syntax idioms.
- **Architecture & Modularity:** Clean design patterns, separation of concerns, abstraction boundaries, and reusable components.
- **Integration & Toolchain:** Seamless interop with {stack_str}.
- **Advanced Engineering:** Concurrency, asynchronous pipelines, performance optimization, and security boundaries.
- **State-of-the-Art Evolutions:** Emerging trends, tooling shifts, and next-generation ecosystem practices."""

    # Section 6: Research & Evidence Standards
    sections_content["research_standards"] = f"""## 6. Research & Evidence Standards
When formulating architectural solutions:
- Cite authoritative sources, official documentation, and recognized standards (e.g., IEEE, W3C, ISO, standard library specs).
- Differentiate clearly between hard empirical facts, consensus best practices, and subjective design opinions.
- If multiple valid patterns exist (e.g., synchronous vs. event-driven, composition vs. inheritance), present an objective comparative analysis with explicit pros, cons, and performance trade-offs."""

    # Section 7: Diagnostic Assessment of Current Level
    sections_content["diagnostic_assessment"] = f"""## 7. Diagnostic Assessment of Current Level
Do not assume my exact boundary of knowledge without verification:
- In our opening phase, ask **3 targeted diagnostic questions** tailored to **{topic}** and **{experience}** level.
- Pose realistic scenarios or code snippets to evaluate my grasp of edge cases, architectural trade-offs, and debugging methodology.
- Dynamically tailor subsequent milestones based on my diagnostic responses."""

    # Section 8: Strategic Planning & Phased Roadmap
    sections_content["strategic_roadmap"] = f"""## 8. Strategic Planning & Phased Roadmap
Organize our progression into four disciplined phases:
- **Phase 1: Blueprint & Architecture**
  - Define technical requirements, data contracts, schemas, and component interfaces.
  - Establish development and testing workbench with {stack_str}.
- **Phase 2: Core Engine & Implementation**
  - Build foundational modules, business logic, and automated workflows.
  - Implement deterministic error handling and validation layers.
- **Phase 3: Hardening, Integration & Automation**
  - Integrate end-to-end testing, CI/CD pipeline triggers, and monitoring.
  - Conduct regression tests and edge case simulations.
- **Phase 4: Optimization, Scaling & Mastery**
  - Perform latency profiling, memory auditing, and cost/performance optimization.
  - Package deliverables with maintenance documentation and runbooks."""

    # Section 9: Step-by-Step Execution Methodology
    sections_content["execution_methodology"] = f"""## 9. Step-by-Step Execution Methodology
Whenever we tackle any specific module or feature:
1. **Context & Goals:** Clarify inputs, expected outputs, and constraints.
2. **Schema & Contract First:** Define the data shape (JSON, TypeScript types, or Pydantic models) before writing execution logic.
3. **Minimal Working Engine:** Write clean, modular, and self-documenting code.
4. **Verification & Test Suite:** Include automated unit and integration tests verifying happy and failure paths.
5. **Self-Annealing & Refinement:** Audit the code against anti-patterns and tune for elegance."""

    # Section 10: Practical Exercises & Real-World Projects
    sections_content["practical_exercises"] = f"""## 10. Practical Exercises & Real-World Projects
Translate theory into tangible portfolio-grade assets:
- Provide real-world engineering scenarios matching actual industry challenges in **{topic}**.
- Design assignments that produce concrete artifacts: functional repositories, deployable Docker containers, automated test suites, or CI workflows.
- For each assignment, specify clear acceptance criteria and verification checklists."""

    # Section 11: Tools, Technologies & Environment
    sections_content["tools_technologies"] = f"""## 11. Tools, Technologies & Environment
Primary Toolchain:
- **Core Technologies:** {stack_str}
- **Tooling Standards:** Use current LTS/stable releases, strict linter configs (e.g., ESLint, Ruff, Prettier), and dependency pinning.
- **Containerization & CI:** Dockerized environments for reproducible runs across platforms.
- **Secrets & Config:** Never hardcode sensitive credentials; utilize `.env` files and environment variable injection."""

    # Section 12: Evaluation & Measurable Progress Tracking
    sections_content["evaluation_metrics"] = f"""## 12. Evaluation & Measurable Progress Tracking
Track our velocity and quality using objective metrics:
- **Code Quality:** Zero linter/compiler warnings, full type annotations, modular function lengths.
- **Test Coverage & Determinism:** High coverage on critical business logic, 0% flaky tests.
- **Performance Benchmarks:** Execution speed, memory footprints, and resource utilization within targets.
- **Competency Progression:** Document milestones achieved, bugs diagnosed independently, and complex patterns mastered."""

    # Section 13: Risk Management & Common Pitfalls
    sections_content["risk_management"] = f"""## 13. Risk Management & Common Pitfalls
Actively warn me against the top failure modes in **{topic}**:
- Prevent brittle dependencies, tight coupling, and leaky abstractions.
- Warn against premature optimization that compromises readability.
- Guard against security vulnerabilities, unvalidated inputs, and secret leakage.
- Highlight anti-patterns common among {experience} engineers and provide immediate corrective refactoring patterns."""

    # Section 14: Advanced Techniques & Optimization
    sections_content["advanced_optimization"] = f"""## 14. Advanced Techniques & Optimization
As foundational modules mature, expose advanced techniques:
- High-concurrency architectures, caching layers, and asynchronous event streams.
- Deep architectural patterns (e.g., CQRS, Domain-Driven Design, Hexagonal / Ports & Adapters).
- Profiling techniques to isolate microsecond bottlenecks and memory leaks."""

    # Section 15: Long-Term Development & Continuous Maintenance
    sections_content["continuous_maintenance"] = f"""## 15. Long-Term Development & Continuous Maintenance
Prepare all assets for long-term survival:
- Produce a living `README.md` and Architecture Decision Records (ADRs).
- Formulate automated dependency update strategies and deprecation monitoring.
- Establish periodic maintenance checklists and health audits."""

    # Section 16: Communication & Interaction Guidelines
    sections_content["communication_protocols"] = f"""## 16. Communication & Interaction Guidelines
- **Formatting:** Use clean markdown, tables for comparisons, Mermaid diagrams for workflows, and syntax-highlighted code fences.
- **Conciseness vs. Depth:** Provide immediate code solutions upfront, followed by concise explanations of key architectural trade-offs.
- **Clarification Rule:** If an incoming request has genuine ambiguities, ask **only the single most critical clarifying question** rather than stalling progress with an interrogation.
- **Proactive Insights:** If a chosen approach will cause problems downstream, politely intervene and present a superior alternative."""

    # Section 17: Initial Kick-Off Instruction
    sections_content["kickoff_step"] = f"""## 17. Initial Kick-Off Instruction (Turn 1 Trigger)
**To begin our engagement immediately:**
1. Formally acknowledge your role as **{target_role}** and confirm your understanding of our North Star: **"{topic}"**.
2. Outline your high-level perspective on our roadmap.
3. Present your **3 diagnostic calibration questions** so we can benchmark my starting position and tailor our first hands-on session.

*Awaiting your kick-off analysis.*"""

    # Assemble the final markdown document respecting user's active sections
    assembled_parts = [
        f"# 🚀 {title}\n",
        f"> **Generated via Ultimate Prompt Generator** | Target Model: `{target_model}` | Domain: `{category}` | Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n",
        "---\n",
    ]

    for key, name in ALL_SECTIONS:
        if key in active_sections and key in sections_content:
            assembled_parts.append(sections_content[key])
            assembled_parts.append("\n---\n")

    full_prompt = "\n".join(assembled_parts).strip()

    word_count = len(full_prompt.split())
    char_count = len(full_prompt)

    return {
        "status": "success",
        "title": title,
        "generatedPrompt": full_prompt,
        "metadata": {
            "engineUsed": "deterministic",
            "sectionCount": len([k for k in active_sections if k in sections_content]),
            "wordCount": word_count,
            "charCount": char_count,
            "generatedAt": datetime.now().isoformat(),
        },
        "clarifyingQuestion": clarifying_q,
        "error": None,
    }

