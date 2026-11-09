"""Domain Intelligence Analyzer for Mindset Builder Agent.
Deconstructs any domain into first principles, industry certifications,
and expert cognitive heuristics.
"""
import json
import os
import sys

# Ensure directory is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from tools.llm_client import generate_llm_response

# Pre-compiled high-fidelity knowledge banks for key domains
KNOWN_DOMAINS = {
    "qa": {
        "domain": "Quality Assurance & Software Testing",
        "category": "Software Engineering & Systems Reliability",
        "tagline": "The Empirical Investigator of Systemic Risk and Behavioral Truth",
        "first_principles": [
            "Testing never proves the absence of defects, only their presence (Dijkstra's Axiom).",
            "Quality is value to some person who matters (Jerry Weinberg's Law).",
            "A test does not merely check expectations; it interrogates assumptions and reveals unanticipated side-effects."
        ],
        "syllabi_and_standards": [
            "ISTQB Certified Tester Foundation & Advanced Level (Test Management, Technical Test Analyst)",
            "ISO/IEC/IEEE 29119 Software and Systems Engineering Standards",
            "Rapid Software Testing (RST) Heuristics by James Bach & Michael Bolton",
            "Context-Driven Testing Principles (Cem Kaner, Brian Marick)"
        ],
        "expert_vs_novice_mindset": {
            "novice": "Sees QA as a mechanical pass/fail checklist runner. Believes the goal is to confirm the software matches the ticket specification and announce 'All Tests Passed'.",
            "expert": "Acts as an empirical scientist and risk auditor. Knows specifications are inherently incomplete. Proactively seeks edge-case stress conditions, unarticulated customer assumptions, and subtle failure states before users suffer."
        },
        "core_cognitive_heuristics": [
            "Boundary Value Skepticism: Bugs cluster at transitions, state changes, and extremes.",
            "Epidemiological Triage: Never fix symptoms without identifying the systemic disease pattern.",
            "Verification vs Validation Split: Built right (verification) means nothing if you built the wrong thing (validation).",
            "Heuristic Error Guessing: Exploiting human cognitive biases embedded in code."
        ],
        "why_mindset_beats_skill": "AI can auto-generate 1,000 unit tests in seconds. But AI lacks the intuitive skepticism to ask: 'What did the product manager assume that will never survive Black Friday traffic?' Mindset is the radar for the unknown unknowns."
    },
    "devops": {
        "domain": "DevOps & Site Reliability Engineering (SRE)",
        "category": "Infrastructure, Cloud & Systems Resilience",
        "tagline": "The Architect of Anti-Fragile, Self-Healing Systems",
        "first_principles": [
            "Failures are inevitable in complex distributed systems; resiliency is engineered, not hoped for.",
            "Automation without observability is merely accelerating catastrophic failure.",
            "Change is the root cause of most incidents; fast rollback and small batch sizes minimize Blast Radius."
        ],
        "syllabi_and_standards": [
            "Google SRE Principles & Error Budget Framework",
            "Certified Kubernetes Administrator (CKA) & Linux Foundation Curriculum",
            "DORA (DevOps Research and Assessment) Four Key Metrics Standard",
            "AWS Certified DevOps Engineer / Azure Solutions Architect"
        ],
        "expert_vs_novice_mindset": {
            "novice": "Focuses on writing YAML files, configuring CI/CD pipelines, and rebooting containers when memory runs out.",
            "expert": "Designs socio-technical systems for failure tolerance, treating infrastructure as living organisms that must self-heal, self-scale, and gracefully degrade under stress."
        },
        "core_cognitive_heuristics": [
            "Blast Radius Containment: Decouple failure domains so a spark doesn't incinerate the datacenter.",
            "Error Budget Discipline: Balance velocity with reliability using empirical SLOs.",
            "Blameless Post-Mortems: Treat errors as structural lessons in human-system interaction.",
            "Observability Triad: Synthesize metrics, logs, and traces into holistic telemetry."
        ],
        "why_mindset_beats_skill": "Writing Terraform or Helm scripts is easily handled by AI. But knowing *when* to trade off latency for consistency, and having the calm operational instincts during a catastrophic P0 outage, cannot be scripted."
    },
    "product": {
        "domain": "Product Management & Strategy",
        "category": "Business, Technology & Customer Psychology",
        "tagline": "The Value Maximizer at the Intersection of Desirability, Viability, and Feasibility",
        "first_principles": [
            "Customers do not want features; they hire products to make progress in their lives (Jobs-to-be-Done).",
            "The greatest waste in software is building something with zero defects that nobody wants.",
            "Strategy is choosing what NOT to do."
        ],
        "syllabi_and_standards": [
            "Pragmatic Institute Certified Product Master (PMC)",
            "AIPMM Certified Product Manager (CPM)",
            "Reforge Product Strategy and Retention Frameworks",
            "Marty Cagan's Silicon Valley Product Group (SVPG) Discovery Model"
        ],
        "expert_vs_novice_mindset": {
            "novice": "Acts as a feature-factory backlog administrator who takes orders from stakeholders and counts sprint velocity.",
            "expert": "Operates as a venture strategist who falls in love with the user's problem, constantly testing hypotheses to de-risk value, usability, feasibility, and business viability."
        },
        "core_cognitive_heuristics": [
            "Opportunity Solution Tree: Map customer pain points before writing solutions.",
            "Inverse Feature Gravitation: The easiest way to improve a product is often removing bloat.",
            "Leading vs Lagging Signals: Optimize for user activation and retention before revenue.",
            "Radical Empathy with Cold Pragmatism: Care deeply about the user, but be ruthlessly objective with metrics."
        ],
        "why_mindset_beats_skill": "Generating PRDs, user stories, and roadmaps can be done by AI. But discerning authentic human customer emotion, political alignment among founders, and navigating asymmetric market bets is pure mindset."
    },
    "security": {
        "domain": "Cybersecurity & Threat Modeling",
        "category": "Defensive Security & Threat Intelligence",
        "tagline": "The Adversarial Thinker in Asymmetric Digital Warfare",
        "first_principles": [
            "Defenders must secure every possible entrance; attackers only need to find a single misconfiguration.",
            "Security is a continuous posture, not a binary state or certification stamp.",
            "Trust is a liability: Assume breach and verify every access request explicitly (Zero Trust)."
        ],
        "syllabi_and_standards": [
            "ISC2 Certified Information Systems Security Professional (CISSP)",
            "OffSec Certified Professional (OSCP) Penetration Testing",
            "NIST Cybersecurity Framework (CSF 2.0)",
            "MITRE ATT&CK Framework & STRIDE Threat Modeling"
        ],
        "expert_vs_novice_mindset": {
            "novice": "Installs antivirus, checks compliance boxes, and blames end users for clicking phishing emails.",
            "expert": "Thinks like a patient, creative adversary. Models attack paths, eliminates lateral movement vectors, and builds defense-in-depth where every compromised layer sounds an alarm."
        },
        "core_cognitive_heuristics": [
            "Least Privilege & Blast Radius Minimization.",
            "Assume Breach (Zero Trust): Operate as if the adversary is already inside the network.",
            "Crown Jewels Prioritization: Protect high-value assets with cryptographic guarantees.",
            "Fail-Closed Security: If a security check breaks, shut the gate rather than default to open."
        ],
        "why_mindset_beats_skill": "Scanning code with SAST/DAST tools is commoditized. But anticipating novel social engineering vectors, zero-day threat combinations, and adversary psychology is an irreplaceable mindset."
    },
    "prompt": {
        "domain": "AI Prompt Engineering & Cognitive Steering",
        "category": "Artificial Intelligence & Computational Linguistics",
        "tagline": "The Epistemic Architect of Latent Space Reasoning",
        "first_principles": [
            "LLMs do not 'know'; they sample probability distributions over multidimensional vector spaces.",
            "Garbage context produces stochastic hallucinations; constraint-driven framing collapses ambiguity.",
            "Separating reasoning from deterministic execution yields 10x higher reliability."
        ],
        "syllabi_and_standards": [
            "DeepLearning.AI & OpenAI ChatGPT Prompt Engineering for Developers",
            "Anthropic Constitutional AI & Prompt Engineering Guidelines",
            "DSPy Declarative Self-Improving Language Programs Framework",
            "B.L.A.S.T. / RICE-POT / Few-Shot In-Context Learning Standards"
        ],
        "expert_vs_novice_mindset": {
            "novice": "Types casual chat requests, gets disappointed by generic answers, and adds 'please be smart'.",
            "expert": "Designs structured cognitive scaffolding—specifying persona, context, constraints, few-shot exemplars, step-by-step thinking delimiters, and deterministic JSON output schemas."
        },
        "core_cognitive_heuristics": [
            "Cognitive Scaffolding: Anchor the model's attention with explicit role and negative constraints.",
            "Chain-of-Thought Scratchpad: Always force intermediate reasoning before final answers.",
            "Delimiter Isolation: Separate instructions from untrusted user inputs with XML or markdown tags.",
            "Self-Consistency Sampling: Validate critical answers across multiple reasoning paths."
        ],
        "why_mindset_beats_skill": "Copying prompt templates is trivial. But understanding how latent embeddings shift under syntactic framing, and knowing how to debug model hallucinations at the cognitive level, is a rare master mindset."
    }
}


def match_known_domain(user_query):
    """Fuzzy check for pre-compiled high fidelity knowledge profiles."""
    q = user_query.lower()
    if any(k in q for k in ["qa", "test", "quality", "sdet", "bug", "tester", "istqb"]):
        return KNOWN_DOMAINS["qa"]
    if any(k in q for k in ["devops", "sre", "reliability", "cloud engineer", "infrastructure", "kubernetes", "docker"]):
        return KNOWN_DOMAINS["devops"]
    if any(k in q for k in ["product", "pm", "product management", "product manager", "scrum product"]):
        return KNOWN_DOMAINS["product"]
    if any(k in q for k in ["security", "cyber", "penetration", "soc", "cissp", "hacker", "infosec"]):
        return KNOWN_DOMAINS["security"]
    if any(k in q for k in ["prompt", "llm", "ai agent", "prompt engineer", "ai prompt"]):
        return KNOWN_DOMAINS["prompt"]
    return None


def analyze_domain(user_query):
    """
    Analyzes any domain or profession entered by the user.
    Uses pre-compiled expertise, or falls back to LLM synthesis / dynamic engine.
    """
    clean_query = user_query.strip()
    if not clean_query:
        clean_query = "Quality Assurance & Software Testing"

    # 1. Check known domain bank first
    known = match_known_domain(clean_query)
    if known:
        return known

    # 2. Try LLM generation (Gemini or Ollama) for arbitrary domains (e.g. Doctor, Pilot, Trader, Architect)
    prompt = f"""
    Analyze the following field or subject through a FIRST-PRINCIPLES MINDSET perspective:
    Field: "{clean_query}"

    Extract:
    1. Canonical domain name and category.
    2. Epistemic tagline defining its core purpose.
    3. Exactly 3 first principles (axioms that cannot be reduced further).
    4. Relevant formal certification syllabi, recognized standards, and international bodies of knowledge.
    5. A sharp contrast between a "novice/procedural mindset" and an "elite/master mindset".
    6. 4 core cognitive heuristics used daily by master practitioners.
    7. A deep explanation of why "Mindset beats mechanical skill" in this domain, especially in an era of AI automation.

    Return strictly a valid JSON object matching this schema:
    {{
      "domain": "Exact Domain Name",
      "category": "Field Category",
      "tagline": "Short evocative summary",
      "first_principles": ["P1", "P2", "P3"],
      "syllabi_and_standards": ["S1", "S2", "S3"],
      "expert_vs_novice_mindset": {{
        "novice": "Description of superficial approach",
        "expert": "Description of deep first-principles approach"
      }},
      "core_cognitive_heuristics": ["H1", "H2", "H3", "H4"],
      "why_mindset_beats_skill": "Detailed paragraph"
    }}
    """
    raw_response, provider = generate_llm_response(prompt, json_mode=True)
    if raw_response:
        try:
            # Clean markdown code blocks if present
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
            data = json.loads(cleaned)
            if "domain" in data and "first_principles" in data:
                return data
        except Exception as e:
            print(f"[Domain Analyzer] Error parsing LLM response: {e}")

    # 3. Dynamic semantic synthesis fallback for completely unknown domain
    title = clean_query.title()
    return {
        "domain": title,
        "category": "Professional Discipline & Cognitive Mastery",
        "tagline": f"Mastery of {title} through first-principles reasoning and strategic intuition",
        "first_principles": [
            f"The map is not the territory: in {title}, procedural guidelines are secondary to real-world context and feedback.",
            f"Optimize for long-term compounding outcomes over short-term optical victories.",
            f"True competence in {title} is revealed when standard procedures fail and ambiguity is high."
        ],
        "syllabi_and_standards": [
            f"Global Standards & Professional Best Practice Frameworks for {title}",
            f"Core Curriculum & Professional Licensure Standards in {title}",
            "First-Principles Cognitive Decision-Making & Risk Governance"
        ],
        "expert_vs_novice_mindset": {
            "novice": f"Sees {title} as a series of instructions and recipes to blindly execute without questioning the underlying assumptions.",
            "expert": f"Operates as a high-leverage strategic thinker in {title}, identifying systemic leverage points, hidden failure modes, and value drivers."
        },
        "core_cognitive_heuristics": [
            "Root-Cause Inversion: Invert the problem to discover what must be avoided first.",
            "Asymmetric Risk Management: Protect downside before calculating upside.",
            "Feedback Velocity: Build rapid signal loops to falsify flawed theories early.",
            "Contextual Calibration: Adapt judgment to the stakes rather than applying uniform dogma."
        ],
        "why_mindset_beats_skill": f"In {title}, AI and automated scripts will execute mechanical tasks exponentially faster. What remains irreplaceable is the intuitive discernment, emotional calibration, and holistic judgment that only an ingrained mindset can deliver."
    }


if __name__ == "__main__":
    test_res = analyze_domain("QA Engineer")
    print(json.dumps(test_res, indent=2))
