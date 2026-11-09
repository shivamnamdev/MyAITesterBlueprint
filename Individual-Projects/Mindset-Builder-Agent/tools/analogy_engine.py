"""Tri-Tier Analogy Generation Engine for Mindset Builder Agent.
Generates 3 cognitive analogies ranked Easy, Medium, and Hard.
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

PRESET_ANALOGIES = {
    "Quality Assurance & Software Testing": {
        "easy": {
            "tier_key": "easy",
            "tier_label": "Easy / Intuitive",
            "badge_color": "emerald",
            "title": "The Personal Diagnostic Doctor (Physician)",
            "character_role": "The Attending Physician & Preventative Doctor",
            "tagline": "Triage, physiological vitals, root-cause diagnosis, and preventative health checkups",
            "narrative": "Consider QA as a personal doctor of the patient. A great doctor doesn't just listen to symptoms and write a superficial prescription for painkillers; they understand human physiology deeply. They conduct regular preventative health checkups (regression testing) to ensure old ailments haven't flared up. When a patient reports dizziness (a UI bug symptom), the doctor doesn't simply treat the head; they order blood tests and ECGs (system log tracing, boundary testing) to catch underlying systemic diseases. They balance verification (did the medicine lower blood pressure?) with validation (is the patient actually healthy and thriving?).",
            "mapping": [
                {
                    "domain_concept": "Regression Testing",
                    "analogy_counterpart": "Routine annual health checkup on vital organs",
                    "intuition": "Checking that previously healthy systems have not secretly deteriorated as the organism aged or changed diets."
                },
                {
                    "domain_concept": "Bug Symptom vs Root Cause",
                    "analogy_counterpart": "Headache (symptom) vs Chronic dehydration / hypertension (root cause)",
                    "intuition": "A button failing to submit is just the fever; the race condition in the database transaction is the real infection."
                },
                {
                    "domain_concept": "Test Case Planning",
                    "analogy_counterpart": "Targeted clinical stress testing & diagnostic panels",
                    "intuition": "You don't run random tests; you hypothesize what organs are most fragile based on medical history and genetic risk factors."
                },
                {
                    "domain_concept": "Smoke / Sanity Testing",
                    "analogy_counterpart": "Checking pulse, airway, and breathing upon arrival in ER triage",
                    "intuition": "If the patient has no pulse, you don't check their cholesterol; if the app won't boot, you don't run UI end-to-end tests."
                },
                {
                    "domain_concept": "Verification vs Validation",
                    "analogy_counterpart": "Did the surgery execute the textbook procedure (Verification) vs Is the patient able to run again (Validation)?",
                    "intuition": "Code can pass every unit test specification perfectly while failing completely to solve the user's actual life problem."
                }
            ]
        },
        "medium": {
            "tier_key": "medium",
            "tier_label": "Medium / Systemic Flow",
            "badge_color": "amber",
            "title": "The Airport Air Traffic Controller & Aviation Safety Board",
            "character_role": "The Tower Watch Supervisor & Pre-Flight Inspector",
            "tagline": "Coordinating inter-dependent trajectories, weather tolerances, and zero-collision release gates",
            "narrative": "A software release is an aircraft with 300 passengers requesting clearance to take off into turbulent weather. The QA engineer is the Air Traffic Controller and FAA Safety Inspector. They don't fly the plane (the developers do), but they inspect weight distribution, cross-winds, flight instruments, and radar beacons. They possess the sovereign authority to wave off a landing or ground a flight if hydraulic pressure shows anomalous jitter, because in aviation, post-takeoff failures are catastrophic.",
            "mapping": [
                {
                    "domain_concept": "Release Readiness / Go-Live Gate",
                    "analogy_counterpart": "Final clearance for runway takeoff",
                    "intuition": "You never clear an aircraft just because the departure schedule says 2:00 PM; you clear it when instrumentation confirms aerodynamic safety."
                },
                {
                    "domain_concept": "Automated CI/CD Pipeline Checks",
                    "analogy_counterpart": "Automated radar transponder and collision-avoidance TCAS pings",
                    "intuition": "Constant, sub-second telemetry alerting controllers if flight paths deviate by a millimeter."
                },
                {
                    "domain_concept": "Chaos & Resiliency Testing",
                    "analogy_counterpart": "Simulating dual engine flameout during gale-force crosswinds",
                    "intuition": "Discovering how pilots and autopilot react when worst-case environmental shocks hit simultaneously."
                },
                {
                    "domain_concept": "Severity vs Priority Triage",
                    "analogy_counterpart": "In-flight cabin entertainment broken (Low Sev / Low Pri) vs Landing gear sensor fault (Critical Sev / Immediate Halt)",
                    "intuition": "Clear-headed discernment separating minor comfort grievances from existential flight hazards."
                }
            ]
        },
        "hard": {
            "tier_key": "hard",
            "tier_label": "Hard / First-Principles Philosophy",
            "badge_color": "indigo",
            "title": "The Popperian Falsificationist & Epistemological Skeptic",
            "character_role": "The Critical Rationalist & Hypothesis Demolisher",
            "tagline": "Karl Popper's philosophy: No amount of passing tests proves correctness; only relentless refutation builds epistemic resilience",
            "narrative": "In Karl Popper's landmark epistemology (The Logic of Scientific Discovery), a theory can never be inductively proven true—no matter how many white swans you observe, the hypothesis 'all swans are white' is never verified. But a single black swan refutes it entirely. Novices believe a test case exists to demonstrate that code works. The master falsificationist knows this is a cognitive fallacy. A test exists to ruthlessly expose the system's fragile assumptions. Software quality is not the accumulation of green checkmarks; it is the degree of rigor with which a system has survived relentless falsification attempts.",
            "mapping": [
                {
                    "domain_concept": "Passing Test Suite",
                    "analogy_counterpart": "A scientific theory that has survived today's falsification attempts",
                    "intuition": "A passing suite does not prove zero bugs; it merely means our current probes were insufficiently creative to break it yet."
                },
                {
                    "domain_concept": "Boundary Value & Negative Testing",
                    "analogy_counterpart": "Designing the exact experiment most lethal to the prevailing dogma",
                    "intuition": "Scientists test general relativity at the extreme gravity of black holes, not by dropping an apple in a living room."
                },
                {
                    "domain_concept": "Heuristic Exploratory Testing",
                    "analogy_counterpart": "Epistemological inquiry navigating the 'unknown unknowns'",
                    "intuition": "Moving past pre-scripted experimental apparatus to interrogate emergent systemic behavior."
                },
                {
                    "domain_concept": "Defect Masking",
                    "analogy_counterpart": "An ad-hoc epicycle added to Ptolemaic astronomy to hide conflicting planetary observations",
                    "intuition": "A crude patch that hides an error instead of revising the foundational architectural model."
                }
            ]
        }
    },
    "DevOps & Site Reliability Engineering (SRE)": {
        "easy": {
            "tier_key": "easy",
            "tier_label": "Easy / Intuitive",
            "badge_color": "emerald",
            "title": "The High-Velocity Formula 1 Pit Crew & Telemetry Engineer",
            "character_role": "F1 Chief Pit Strategist",
            "tagline": "Sub-two-second tire changes, live telemetry sensors, and rapid mid-race adaptations",
            "narrative": "A production web application is a Formula 1 racecar speeding around the track at 200 mph. SREs are the pit crew and live telemetry analysts. You cannot tell the driver to shut off the car for two days while you swap the engine (zero downtime). You must refuel, replace tires in 1.8 seconds (seamless CI/CD deployment), and monitor tire degradation sensors (observability) so you change tires *before* they blow out at the corner.",
            "mapping": [
                {
                    "domain_concept": "Zero-Downtime Deployment",
                    "analogy_counterpart": "1.8 second live pit stop while keeping the car in the race",
                    "intuition": "Upgrading parts without stopping customer traffic."
                },
                {
                    "domain_concept": "SLO & Error Budgets",
                    "analogy_counterpart": "Allowed tire wear percentage before forcing a pit stop",
                    "intuition": "Knowing exactly how much risk you can take before performance degrades dangerously."
                },
                {
                    "domain_concept": "Canary Releases",
                    "analogy_counterpart": "Testing soft tires on one car for 2 laps to read asphalt grip",
                    "intuition": "Validating changes with 5% of traffic before rolling out to 100%."
                }
            ]
        },
        "medium": {
            "tier_key": "medium",
            "tier_label": "Medium / Systemic Flow",
            "badge_color": "amber",
            "title": "The Metropolitan Power Grid & Substation Dispatcher",
            "character_role": "Grid Operations Chief",
            "tagline": "Dynamic load balancing, transformer circuit breakers, and rolling blackout prevention",
            "narrative": "A distributed cloud architecture behaves like a regional electrical grid. SREs act as grid controllers. When millions of citizens turn on air conditioners during a heat wave (traffic spikes), dispatchers must instantly route hydroelectric reserves, trigger automated circuit breakers to protect substations from melting down (rate limiting & circuit breakers), and isolate failing transmission lines before a cascading blackout plunges the entire eastern seaboard into darkness.",
            "mapping": [
                {
                    "domain_concept": "Circuit Breakers & Rate Limiting",
                    "analogy_counterpart": "Electrical substation breakers tripping to save the generator from fire",
                    "intuition": "Intentionally shedding non-essential load to protect core databases from collapse."
                },
                {
                    "domain_concept": "Auto-scaling & Elasticity",
                    "analogy_counterpart": "Peaker gas plants spinning up within seconds when demand surges",
                    "intuition": "Dynamic capacity injection matching demand curves in real time."
                },
                {
                    "domain_concept": "Cascading Failure Isolation",
                    "analogy_counterpart": "Sectionalizing grid interconnects to stop blackout propagation",
                    "intuition": "Decoupling microservices so an image rendering outage never blocks payment processing."
                }
            ]
        },
        "hard": {
            "tier_key": "hard",
            "tier_label": "Hard / First-Principles Philosophy",
            "badge_color": "indigo",
            "title": "Biological Homeostasis & Antifragile Immune Networks",
            "character_role": "The Evolutionary Biologist & Cellular Immunologist",
            "tagline": "Nassim Taleb's Antifragility: Systems that grow stronger under non-lethal stressors",
            "narrative": "Complex distributed systems are not static bridges; they are dynamic, non-linear living ecologies. In Nassim Taleb's terminology, fragile systems break under volatility; robust systems merely resist; but antifragile systems (like the human immune system) actively adapt and become stronger from micro-shocks. Chaos Engineering (Netflix Chaos Monkey) is digital vaccination: introducing small controlled pathogen spikes to trigger systemic antibodies, hardening nodes before unpredictable biological epidemics hit.",
            "mapping": [
                {
                    "domain_concept": "Chaos Engineering",
                    "analogy_counterpart": "Vaccines and physical exercise creating muscular micro-tears that rebuild denser muscle",
                    "intuition": "Deliberately causing safe failures in production to eliminate hidden brittle points."
                },
                {
                    "domain_concept": "Self-Healing Pods / Auto-Recovery",
                    "analogy_counterpart": "Cellular apoptosis (programmed cell death) when DNA corruption is detected",
                    "intuition": "Terminating sick containers without human intervention and spawning healthy clones."
                },
                {
                    "domain_concept": "Observability Tracing",
                    "analogy_counterpart": "Endocrine hormone feedback loops regulating body temperature",
                    "intuition": "Autonomic nervous system sensing distress signals and adjusting vascular flow automatically."
                }
            ]
        }
    }
}


def generate_analogies_for_domain(domain_intel):
    """
    Returns 3 analogies (Easy, Medium, Hard) for the given domain.
    Matches pre-compiled presets or dynamically synthesizes using LLM.
    """
    domain_name = domain_intel.get("domain", "")

    # 1. Check presets
    for k, v in PRESET_ANALOGIES.items():
        if k.lower() in domain_name.lower() or domain_name.lower() in k.lower():
            return v

    # Also fuzzy check keywords
    q = domain_name.lower()
    if any(k in q for k in ["qa", "test", "quality", "sdet"]):
        return PRESET_ANALOGIES["Quality Assurance & Software Testing"]
    if any(k in q for k in ["devops", "sre", "reliability", "infrastructure"]):
        return PRESET_ANALOGIES["DevOps & Site Reliability Engineering (SRE)"]

    # 2. Try LLM generation for arbitrary domains
    prompt = f"""
    You are an expert cognitive pedagogue and mental model architect.
    Design 3 multi-layered real-world analogies to wire the true MINDSET of this domain into human intuition:
    Domain: "{domain_name}"
    Category: "{domain_intel.get('category', '')}"
    Tagline: "{domain_intel.get('tagline', '')}"

    Create THREE analogies ranked by cognitive depth:
    1. EASY: Intuitive, everyday, organic (e.g. Doctor, Chef, Gardener, Sports Coach).
    2. MEDIUM: Systemic, operational, coordination flow (e.g. Airport Control, Formula 1 Pit, Symphony Conductor, Power Grid).
    3. HARD: Deep, first-principles, philosophical, scientific (e.g. Popperian Falsification, Game Theory, Thermodynamic Entropy, Biological Homeostasis).

    Each analogy MUST include:
    - title
    - character_role
    - tagline
    - narrative (compelling 3-4 sentence storytelling paragraph)
    - mapping (list of 3-4 objects with 'domain_concept', 'analogy_counterpart', 'intuition')

    Return strictly a valid JSON object matching:
    {{
      "easy": {{
        "tier_key": "easy",
        "tier_label": "Easy / Intuitive",
        "badge_color": "emerald",
        "title": "...",
        "character_role": "...",
        "tagline": "...",
        "narrative": "...",
        "mapping": [{{"domain_concept": "...", "analogy_counterpart": "...", "intuition": "..."}}]
      }},
      "medium": {{
        "tier_key": "medium",
        "tier_label": "Medium / Systemic Flow",
        "badge_color": "amber",
        "title": "...",
        "character_role": "...",
        "tagline": "...",
        "narrative": "...",
        "mapping": [{{"domain_concept": "...", "analogy_counterpart": "...", "intuition": "..."}}]
      }},
      "hard": {{
        "tier_key": "hard",
        "tier_label": "Hard / First-Principles Philosophy",
        "badge_color": "indigo",
        "title": "...",
        "character_role": "...",
        "tagline": "...",
        "narrative": "...",
        "mapping": [{{"domain_concept": "...", "analogy_counterpart": "...", "intuition": "..."}}]
      }}
    }}
    """
    raw_response, provider = generate_llm_response(prompt, json_mode=True)
    if raw_response:
        try:
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
            data = json.loads(cleaned)
            if "easy" in data and "medium" in data and "hard" in data:
                return data
        except Exception as e:
            print(f"[Analogy Engine] Error parsing LLM analogy: {e}")

    # 3. Dynamic synthesis fallback for arbitrary domains
    return {
        "easy": {
            "tier_key": "easy",
            "tier_label": "Easy / Intuitive",
            "badge_color": "emerald",
            "title": f"The Master Craftsman & Diagnostic Physician of {domain_name}",
            "character_role": "The Observant Master Practitioner",
            "tagline": f"Direct sensory awareness, routine preventative checks, and acute diagnostic intuition in {domain_name}",
            "narrative": f"In {domain_name}, an expert acts like an experienced diagnostic physician or master craftsman. They don't just mechanically follow instructions; they sense friction, listen to subtle creaks in the structure, and diagnose the underlying pathology before visible failure spreads.",
            "mapping": [
                {
                    "domain_concept": "Routine Execution & Standards",
                    "analogy_counterpart": "Annual preventative physical checkup",
                    "intuition": "Ensuring foundational health metrics are steady before attempting strenuous loads."
                },
                {
                    "domain_concept": "Handling Acute Edge Cases",
                    "analogy_counterpart": "Emergency room triage under unexpected trauma",
                    "intuition": "Isolating high-bleed points first rather than treating superficial abrasions."
                },
                {
                    "domain_concept": "Validation of Outcome",
                    "analogy_counterpart": "Confirming the patient has regained vibrant vitality, not just normalized numbers",
                    "intuition": "Solving the real human objective rather than merely ticking box requirements."
                }
            ]
        },
        "medium": {
            "tier_key": "medium",
            "tier_label": "Medium / Systemic Flow",
            "badge_color": "amber",
            "title": f"The Symphony Conductor & Mission Control Director for {domain_name}",
            "character_role": "System Orchestrator & Flow Director",
            "tagline": f"Synchronizing multi-variable dependencies, feedback channels, and structural rhythm in {domain_name}",
            "narrative": f"Mastery in {domain_name} resembles conducting an 80-piece orchestra or directing NASA Mission Control. Different instruments play distinct parts; tempo must be synchronized; and a discordant note in the brass section can destroy the acoustic harmony if not calibrated in real time.",
            "mapping": [
                {
                    "domain_concept": "Inter-team Coordination",
                    "analogy_counterpart": "Harmonizing woodwinds, strings, and percussion",
                    "intuition": "Balancing disparate speeds and priorities into a coherent output."
                },
                {
                    "domain_concept": "Telemetry & Observability",
                    "analogy_counterpart": "Real-time acoustic feedback and conductor score sheet",
                    "intuition": "Maintaining full situational awareness across the entire performance."
                },
                {
                    "domain_concept": "Graceful Degradation",
                    "analogy_counterpart": "Soloist improvisation when a string snaps mid-concerto",
                    "intuition": "Adapting fluidly without allowing the entire concert to halt."
                }
            ]
        },
        "hard": {
            "tier_key": "hard",
            "tier_label": "Hard / First-Principles Philosophy",
            "badge_color": "indigo",
            "title": f"The Evolutionary Ecology & Cybernetic Feedback Architecture of {domain_name}",
            "character_role": "The First-Principles System Theorist",
            "tagline": f"Norbert Wiener's Cybernetics and Complex Adaptive Systems in {domain_name}",
            "narrative": f"At the highest cognitive level, {domain_name} is governed by cybernetic feedback loops and evolutionary fitness landscapes. Systems are never static; every action alters the environment, triggering second-order adaptations and emergent risks. The elite mindset designs self-regulating equilibrium loops that harvest entropy to increase long-term robustness.",
            "mapping": [
                {
                    "domain_concept": "Adaptive Decision Making",
                    "analogy_counterpart": "Homeostatic negative feedback loop maintaining cellular pH",
                    "intuition": "Dynamic equilibrium that continually auto-corrects against systemic drift."
                },
                {
                    "domain_concept": "First-Principles Falsification",
                    "analogy_counterpart": "Natural selection eliminating maladaptive traits under environmental shifts",
                    "intuition": "Letting flawed theories die so the organism doesn't have to."
                },
                {
                    "domain_concept": "Antifragility",
                    "analogy_counterpart": "Hormesis: low-dose toxic stressors stimulating cellular rejuvenation",
                    "intuition": "Using controlled turbulence to make the overall architecture immune to fatal shocks."
                }
            ]
        }
    }


if __name__ == "__main__":
    from tools.domain_analyzer import analyze_domain
    intel = analyze_domain("Quality Assurance & Software Testing")
    res = generate_analogies_for_domain(intel)
    print(json.dumps(res, indent=2))
