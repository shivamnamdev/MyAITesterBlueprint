"""Curriculum & Pedagogical Mindset Engine for Mindset Builder Agent.
Generates 5-chapter structured learning journeys with rich storytelling narratives,
visual SVG story illustrations, and interactive scenario drills.
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


def get_doctor_svg_scene(chapter_id):
    """Generate illustrative inline SVGs for the Doctor storytelling chapters."""
    if chapter_id == 1:
        # Stethoscope & Vitals Waveform
        return """<svg viewBox="0 0 600 160" class="story-illustration-svg" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="1"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="600" height="160" rx="12" fill="#0d1527"/>
  <!-- Grid lines -->
  <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" stroke-dasharray="4"/>
  <line x1="0" y1="80" x2="600" y2="80" stroke="#1e293b" stroke-dasharray="4"/>
  <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" stroke-dasharray="4"/>
  <!-- ECG Line -->
  <path d="M 10 80 L 120 80 L 135 60 L 145 105 L 160 30 L 175 130 L 190 70 L 205 80 L 320 80 L 335 60 L 345 105 L 360 20 L 375 140 L 390 70 L 405 80 L 590 80" fill="none" stroke="url(#waveGrad)" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Pulse Dot -->
  <circle cx="360" cy="20" r="4.5" fill="#38bdf8">
    <animate attributeName="r" values="3.5;6;3.5" dur="1.2s" repeatCount="indefinite"/>
  </circle>
  <!-- Labels -->
  <text x="24" y="32" fill="#94a3b8" font-size="11" font-family="monospace">PATIENT VITALS // LATENCY TELEMETRY</text>
  <text x="510" y="32" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">950ms SPIKE</text>
  <text x="24" y="142" fill="#64748b" font-size="10">Surface tests pass green (37°C) while internal cardiovascular pressure surges.</text>
</svg>"""
    elif chapter_id == 2:
        # Differential Diagnostic Lab Tree
        return """<svg viewBox="0 0 600 160" class="story-illustration-svg" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="160" rx="12" fill="#0d1527"/>
  <!-- Nodes of differential diagnosis -->
  <circle cx="90" cy="80" r="28" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="90" y="84" fill="#f8fafc" font-size="10" text-anchor="middle" font-family="monospace">SYMPTOM</text>
  
  <line x1="118" y1="80" x2="220" y2="45" stroke="#475569" stroke-width="2"/>
  <line x1="118" y1="80" x2="220" y2="80" stroke="#38bdf8" stroke-width="2.5"/>
  <line x1="118" y1="80" x2="220" y2="115" stroke="#475569" stroke-width="2"/>

  <!-- Path A -->
  <circle cx="240" cy="45" r="18" fill="#1e293b" stroke="#64748b"/>
  <text x="240" y="49" fill="#94a3b8" font-size="9" text-anchor="middle">UI Glitch</text>
  <text x="270" y="49" fill="#64748b" font-size="9">✕ Ruled Out</text>

  <!-- Path B (The Disease) -->
  <circle cx="240" cy="80" r="20" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
  <text x="240" y="84" fill="#f8fafc" font-size="9" text-anchor="middle" font-weight="bold">Race Cond</text>
  <line x1="260" y1="80" x2="380" y2="80" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3"/>
  <rect x="380" y="60" width="190" height="40" rx="6" fill="#1e293b" stroke="#38bdf8"/>
  <text x="390" y="78" fill="#38bdf8" font-size="10" font-weight="bold">ROOT PATHOLOGY FOUND</text>
  <text x="390" y="92" fill="#94a3b8" font-size="9">Async Redis token cache collision</text>

  <!-- Path C -->
  <circle cx="240" cy="115" r="18" fill="#1e293b" stroke="#64748b"/>
  <text x="240" y="119" fill="#94a3b8" font-size="9" text-anchor="middle">DB Deadlock</text>
  <text x="270" y="119" fill="#64748b" font-size="9">✕ Ruled Out</text>
</svg>"""
    elif chapter_id == 3:
        # Verification vs Validation Scales
        return """<svg viewBox="0 0 600 160" class="story-illustration-svg" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="160" rx="12" fill="#0d1527"/>
  <!-- Verification box -->
  <rect x="40" y="35" width="220" height="90" rx="8" fill="#1e293b" stroke="#64748b"/>
  <text x="56" y="60" fill="#94a3b8" font-size="11" font-weight="bold" font-family="monospace">VERIFICATION (The Protocol)</text>
  <text x="56" y="80" fill="#f8fafc" font-size="10">"Did we follow the exact spec?"</text>
  <text x="56" y="100" fill="#34d399" font-size="10">✓ Scalpel incision exact: 4.2cm</text>
  <text x="56" y="114" fill="#fbbf24" font-size="9">Status: Passed Checklist</text>

  <!-- Split Divider -->
  <line x1="300" y1="25" x2="300" y2="135" stroke="#334155" stroke-width="2" stroke-dasharray="4"/>
  <text x="300" y="85" fill="#38bdf8" font-size="12" text-anchor="middle" font-weight="bold">VS</text>

  <!-- Validation box -->
  <rect x="340" y="35" width="220" height="90" rx="8" fill="#082f49" stroke="#38bdf8"/>
  <text x="356" y="60" fill="#38bdf8" font-size="11" font-weight="bold" font-family="monospace">VALIDATION (Human Health)</text>
  <text x="356" y="80" fill="#f8fafc" font-size="10">"Did we heal the patient's pain?"</text>
  <text x="356" y="100" fill="#38bdf8" font-size="10">★ Can the human run and walk freely?</text>
  <text x="356" y="114" fill="#a7f3d0" font-size="9">Status: True Value Guardian</text>
</svg>"""
    elif chapter_id == 4:
        # The ER Surgical Hard Stop
        return """<svg viewBox="0 0 600 160" class="story-illustration-svg" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="160" rx="12" fill="#0d1527"/>
  <!-- Warning pulse beacon -->
  <rect x="30" y="30" width="100" height="100" rx="10" fill="#450a0a" stroke="#f43f5e" stroke-width="2"/>
  <circle cx="80" cy="70" r="18" fill="#f43f5e"/>
  <text x="80" y="75" fill="#fff" font-size="14" text-anchor="middle" font-weight="bold">!</text>
  <text x="80" y="112" fill="#fca5a5" font-size="10" text-anchor="middle" font-weight="bold">HARD STOP</text>

  <!-- Timeline of decision -->
  <rect x="160" y="40" width="400" height="80" rx="8" fill="#1e293b" stroke="#38bdf8"/>
  <text x="175" y="65" fill="#38bdf8" font-size="11" font-weight="bold">CRISIS GOVERNANCE: TRAUMA SURGEON TRIAGE</text>
  <text x="175" y="85" fill="#f8fafc" font-size="10">Executive Pressure: "Deploy now to meet the deadline!"</text>
  <text x="175" y="103" fill="#a7f3d0" font-size="9.5">Doctor's Response: "P0 billing paths protected; cosmetic modules deferred."</text>
</svg>"""
    else:
        # Synthesis DNA / Mindset Helix
        return """<svg viewBox="0 0 600 160" class="story-illustration-svg" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="160" rx="12" fill="#0d1527"/>
  <circle cx="100" cy="80" r="30" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="100" y="84" fill="#38bdf8" font-size="10" text-anchor="middle" font-weight="bold">OBSERVE</text>
  
  <line x1="130" y1="80" x2="220" y2="80" stroke="#38bdf8" stroke-width="2"/>
  
  <circle cx="250" cy="80" r="30" fill="#0f172a" stroke="#818cf8" stroke-width="2"/>
  <text x="250" y="84" fill="#818cf8" font-size="10" text-anchor="middle" font-weight="bold">DIAGNOSE</text>

  <line x1="280" y1="80" x2="370" y2="80" stroke="#818cf8" stroke-width="2"/>

  <circle cx="400" cy="80" r="30" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
  <text x="400" y="84" fill="#34d399" font-size="10" text-anchor="middle" font-weight="bold">VALIDATE</text>

  <text x="470" y="84" fill="#f8fafc" font-size="12" font-weight="bold">→ LIFELONG REFLEX</text>
  <text x="30" y="142" fill="#94a3b8" font-size="10">Skills degrade and automate. Mindset compounds with memory and experience.</text>
</svg>"""


def build_qa_doctor_curriculum():
    """High-caliber storytelling curriculum for QA via the Doctor analogy."""
    return [
        {
            "chapter_id": 1,
            "title": "Chapter 1: The Perceptual Lens - The Physician's Stethoscope",
            "subtitle": "How a Master QA Perceives Systemic Health vs. Surface Symptoms",
            "story": {
                "act_title": "Act I: The ICU Monitor That Lied",
                "setting": "Metropolitan Central Hospital, Trauma Unit — 02:15 AM",
                "characters": "Dr. Elena Vance (Attending Diagnostic Physician) & Resident Dr. Julian",
                "narrative": (
                    "The telemetry screen for Patient 402 flashed steady green digits: Heart Rate 72 bpm, Blood Pressure 120/80, Oxygen Saturation 99%. "
                    "'Look at that, Elena,' Resident Julian smiled, adjusting his clipboard. 'All vitals normal. We can sign off and clear the patient for discharge.'\n\n"
                    "Elena didn't look at the clipboard. She was already at the patient's bedside, warming the diaphragm of her stethoscope against her palm. "
                    "She listened to the left lower lobe of the lung, then pressed her fingers against the patient's femoral pulse.\n\n"
                    "'Julian,' Elena whispered, her voice razor calm. 'Look closely at his capillary refill in the fingernails. Three seconds. "
                    "Listen to that faint crepitation behind the breath sound. The monitor shows green because our sensors only read coarse average voltages. "
                    "Underneath, his micro-vasculature is leaking fluid into interstitial tissue. If we discharge this man now, he goes into septic shock by sunrise.'\n\n"
                    "Julian froze. The numbers had blinded him. He had trusted the green dashboard over physiological reality."
                ),
                "svg_banner": get_doctor_svg_scene(1),
                "cognitive_bridge": (
                    "In software testing, novices act like Julian—if the CI/CD pipeline shows 100% green checkmarks and HTTP 200 OK, "
                    "they sign the release ticket and declare victory. But an elite QA operates like Elena. "
                    "They look at micro-latencies, thread pool saturation, and memory creep. A passing functional test only tells you "
                    "the server hasn't crashed *yet*; it takes the doctor's ear to hear the systemic friction before Black Friday traffic suffocates the database."
                )
            },
            "concept_breakdown": (
                "A novice tester looks at an app like someone reading an owner's manual—they tap buttons "
                "to see if the lights turn on. An elite QA operates as a diagnostic clinician. "
                "When a doctor examines a patient, they know the human body is an interconnected organism: "
                "a tremor in the hand might stem from an electrical imbalance in the brain, or a kidney filtering failure. "
                "In software, a 500 error on the checkout page is just the surface fever. The true infection is often an unhandled "
                "database lock or a microservice timeout. You must learn to hear the heartbeat of the architecture."
            ),
            "analogy_immersion": (
                "**The Doctor's Vitals Check:** When an EMT arrives at an accident scene, they never start by checking the patient's "
                "dental hygiene. They check ABCs: Airway, Breathing, Circulation (Smoke Testing). "
                "Once vitals stabilize, they schedule regular preventative health checkups (Regression Testing) to verify that old surgeries "
                "or chronic conditions have not relapsed under new environmental stress."
            ),
            "golden_axiom": "Never mistake the symptom for the disease. A passing UI test is only proof of normal skin temperature, not internal organ health.",
            "reflection_prompt": "When you encounter a flaky test or unexpected behavior, do you retry it until it passes green, or do you order a 'blood panel' (server logs, memory dumps, network traces) to find the hidden arrhythmia?",
            "scenario_drill": {
                "situation": "Two days before major Black Friday release, marketing launches a promotional campaign. Suddenly, the user registration endpoint response latency creeps from 120ms to 950ms. All functional tests still pass green.",
                "question": "As the Attending Diagnostic Physician of this software, how do you respond?",
                "options": [
                    {
                        "id": "A",
                        "label": "Declare release ready because 100% of functional tests are passing green.",
                        "mindset_alignment": "Novice / Checklist Follower",
                        "verdict": "CRITICAL RISK: You treated normal skin temperature while ignoring an impending heart attack. Under 10x Black Friday load, that 950ms latency will compound into thread pool exhaustion and bring down the entire server."
                    },
                    {
                        "id": "B",
                        "label": "File a low-priority cosmetic ticket for after the holiday sale since no users are seeing error codes yet.",
                        "mindset_alignment": "Superficial Triage",
                        "verdict": "FAIL: You ignored early warning signs of systemic organ failure. High latency under low traffic is a flashing warning light."
                    },
                    {
                        "id": "C",
                        "label": "Halt the release gate, order an immediate telemetry trace on database connection pool saturation, and run a targeted concurrency stress test.",
                        "mindset_alignment": "Master Diagnostic Mindset",
                        "verdict": "EXCELLENT: You acted as an elite physician. You recognized that latency is elevated blood pressure indicating internal vascular bottleneck before cardiac arrest."
                    }
                ]
            }
        },
        {
            "chapter_id": 2,
            "title": "Chapter 2: The Diagnostic Framework - Differential Diagnosis",
            "subtitle": "Distinguishing Fever from Infection, and Planning Targeted Interventions",
            "story": {
                "act_title": "Act II: The Phantom Seizure",
                "setting": "Neurology Consultation Suite — 14:30 PM",
                "characters": "Dr. Elena Vance & Chief of Surgery Dr. Thorne",
                "narrative": (
                    "'We did an MRI, a CT scan, and basic bloodwork,' Thorne barked, tossing the patient chart onto Elena's desk. "
                    "'Everything came back negative. The patient twitches every three hours, but when we bring him into the scanning chamber, "
                    "the seizure stops. We're about to write it off as psychosomatic and discharge him.'\n\n"
                    "Elena didn't close the file. 'How was the blood draw timed?' she asked.\n\n"
                    "'Standard routine,' Thorne shrugged. 'Morning 8:00 AM on an empty stomach.'\n\n"
                    "'And when does he eat lunch?' Elena continued. 'At 11:30 AM, right before the twitch begins. "
                    "You tested him in a static, quiescent state. His pathology is metabolic and stimulus-dependent. "
                    "Order a continuous glycemic telemetry sensor and draw a blood gas profile at the exact peak of carbohydrate digestion.'\n\n"
                    "Two hours later, the trace arrived: severe reactive post-prandial hypoglycemia. A localized insulinoma that only fired under digestive load."
                ),
                "svg_banner": get_doctor_svg_scene(2),
                "cognitive_bridge": (
                    "When a developer tells you: 'I ran the test locally 5 times, Works on My Machine / Cannot Reproduce', "
                    "they are Dr. Thorne testing a resting patient at 8:00 AM! "
                    "A master QA designs **differential diagnoses**. They know rare bugs only fire under specific physiological stimulus: "
                    "concurrency spikes, stale Redis cache windows, or token expiration transitions. They don't close the ticket; they hunt the stimulus."
                )
            },
            "concept_breakdown": (
                "Novice testers write sprawling, unfocused test cases hoping to 'catch bugs by luck'. "
                "Master QA professionals plan test cases like diagnostic medical panels. "
                "If a patient has a genetic predisposition to heart disease, the cardiologist orders a targeted stress echocardiogram. "
                "Similarly, when a codebase has high cyclomatic complexity, rapid developer churn, or financial calculations, "
                "the QA crafts precision boundary-value and state-transition tests designed to expose systemic failure."
            ),
            "analogy_immersion": (
                "**Differential Diagnosis (The 'House M.D.' Approach):** When confronted with an elusive bug that only reproduces "
                "1 out of 20 times, the master tester does not say 'Cannot Reproduce / Closed'. They construct a differential diagnosis: "
                "Is it a race condition? Memory leak? Stale Redis cache? Network jitter? They methodically rule out possibilities "
                "through targeted isolation experiments."
            ),
            "golden_axiom": "An undiagnosed intermittent symptom is an unexploded bomb in production.",
            "reflection_prompt": "How do you document bugs? Do you write 'Button doesn't work' or do you provide patient history, bloodwork telemetry, and the exact stimulus that triggered the spasm?",
            "scenario_drill": {
                "situation": "A user reports: 'Sometimes my shopping cart total drops by $10 when I refresh the page.' The developer says: 'I tested it 5 times locally, it works fine for me. Works on my machine.'",
                "question": "What does the Master QA Doctor do next?",
                "options": [
                    {
                        "id": "A",
                        "label": "Close the bug as 'Cannot Reproduce' since the developer couldn't see it.",
                        "mindset_alignment": "Passive Subservience",
                        "verdict": "FAIL: You abandoned a sick patient because their fever subsided for 10 minutes in the clinic."
                    },
                    {
                        "id": "B",
                        "label": "Formulate a differential diagnosis: hypothesize async session caching or currency rounding concurrency, inspect distributed trace logs during user refresh, and write an isolated script hammering the cart with concurrent refresh requests.",
                        "mindset_alignment": "Master Diagnostic Mindset",
                        "verdict": "EXCELLENT: You recognized that rare symptoms indicate timing-dependent pathologies (race conditions) that only manifest under specific systemic physiological stress."
                    },
                    {
                        "id": "C",
                        "label": "Ask the user to send a screen recording and wait for more users to complain.",
                        "mindset_alignment": "Procedural Delay",
                        "verdict": "MEDIOCRE: You are letting the patient suffer while offloading the investigation onto the victim."
                    }
                ]
            }
        },
        {
            "chapter_id": 3,
            "title": "Chapter 3: Verification vs. Validation - Protocol vs. Life",
            "subtitle": "Did We Execute the Surgical Checklist, or Did We Restore Human Health?",
            "story": {
                "act_title": "Act III: The Flawless Surgery That Failed the Patient",
                "setting": "Orthopedic Post-Op Ward — 11:00 AM",
                "characters": "Dr. Elena Vance & Orthopedic Fellow Mark",
                "narrative": (
                    "Mark proudly held up the surgical audit: 'Look at the compliance matrix, Elena. "
                    "Pre-op checklist: 100%. Titanium bone plate alignment: exact to 0.1 millimeter. Sutures placed: precisely 28 stitches. "
                    "By every surgical protocol in the textbook, this procedure is a certified textbook triumph.'\n\n"
                    "Elena walked over to the patient, an elderly violinist named Arthur. Arthur was weeping quietly.\n\n"
                    "'Arthur,' Elena asked softly, 'can you flex your index finger?'\n\n"
                    "Arthur tried, but his wrist locked in agonizing spasm. The titanium plate was placed in strict accordance with the manual, "
                    "but it compressed the median nerve channel. Arthur would never hold a bow again.\n\n"
                    "Elena turned to Mark, her gaze stern: 'Mark, you verified that you followed every sentence in the surgical manual. "
                    "That is Verification. But you failed Validation. Arthur did not come here to receive 28 neat stitches; he came here to play music.'"
                ),
                "svg_banner": get_doctor_svg_scene(3),
                "cognitive_bridge": (
                    "Verification asks: *'Did we build the product according to the written acceptance criteria?'* "
                    "Validation asks: *'Does this software actually heal the customer's pain and preserve human trust?'* "
                    "When an engineering team builds an error modal that prints 'System Error Code: 0x884', it verifies 100% of the JIRA spec. "
                    "Yet an elderly banking user reads that code, panics, and believes their life savings were stolen. "
                    "A QA who only verifies is an automated script. A QA who validates is the guardian of human value."
                )
            },
            "concept_breakdown": (
                "In medical school, doctors are taught: 'The surgery was a complete technical success, but the patient died.' "
                "Verification asks: 'Did we follow every spec in the JIRA ticket?' (Did the scalpel make a 4cm incision?). "
                "Validation asks: 'Does this software actually heal the customer's pain and preserve trust?' (Can the patient walk out of the hospital and resume their life?). "
                "A QA who only verifies is an automated robot. A QA who validates is an irreplaceable guardian of value."
            ),
            "analogy_immersion": (
                "**The Placebo vs The Cure:** A medicine can pass chemical purity tests (100% test coverage) and yet be ineffective "
                "or induce dangerous nausea. Master QA constantly tests the human UX reality, edge-case user confusion, and unhandled real-world messiness."
            ),
            "golden_axiom": "A feature that matches 100% of the specification but frustrates the user is a defect in human validation.",
            "reflection_prompt": "When you test a feature, do you only verify against the written acceptance criteria, or do you challenge the criteria if they don't make sense for the real user?",
            "scenario_drill": {
                "situation": "The JIRA spec for a banking app states: 'If a user enters an invalid transfer amount, display a modal pop-up error with message: Error Code 0x884.' The modal passes every automated check.",
                "question": "How do you evaluate this as a QA guardian of user health?",
                "options": [
                    {
                        "id": "A",
                        "label": "Approve the ticket immediately because the code strictly conforms to the acceptance criteria.",
                        "mindset_alignment": "Rule-Bound Novice",
                        "verdict": "FAIL: You verified the protocol, but failed the human validation. An elderly customer reading '0x884' will panic and call customer support, thinking their life savings are lost."
                    },
                    {
                        "id": "B",
                        "label": "Raise a validation defect to Product: explain that raw hex codes induce user anxiety, and advocate for clear actionable guidance (e.g., 'Amount exceeds daily transfer limit of $5,000').",
                        "mindset_alignment": "Master Value Guardian",
                        "verdict": "EXCELLENT: You protected both customer trust and organizational support overhead by treating user psychology as part of system health."
                    }
                ]
            }
        },
        {
            "chapter_id": 4,
            "title": "Chapter 4: The Crucible - The Midnight Code Black",
            "subtitle": "Crisis Governance: Maintaining Scientific Composure Under Executive Chaos",
            "story": {
                "act_title": "Act IV: The Hard Stop in Operating Room 3",
                "setting": "Surgical Suite 3 — 23:45 PM",
                "characters": "Dr. Elena Vance & Hospital Administrator Davis",
                "narrative": (
                    "The hospital intercom crackled with urgency. Board members were pacing the viewing gallery. "
                    "Davis burst through the double doors: 'Elena! The donors are in the amphitheater. The surgical procedure is running 45 minutes late. "
                    "Close the patient up and transfer him to recovery now!'\n\n"
                    "Elena didn't move. Her surgical forceps were steady in the sterile field. "
                    "'Scrub nurse,' Elena called calmly. 'Sponge count.'\n\n"
                    "'Count is nineteen, Doctor,' Nurse Maya replied. 'We started with twenty.'\n\n"
                    "'Skip the search!' Davis demanded, veins bulging on his forehead. 'We have hundreds of thousands of dollars on the line. One sponge won't kill him!'\n\n"
                    "Elena looked up directly into Davis's eyes. Her voice dropped an octave, commanding absolute stillness across the room. "
                    "'Davis, step outside this sterile line. That missing sponge in an abdominal cavity causes fatal peritonitis in 48 hours. "
                    "I am calling a Hard Stop. We run an immediate fluoroscopic scan, retrieve the gauze, and then—and only then—do we close. "
                    "My duty is to the patient's survival, not your donor reception.'"
                ),
                "svg_banner": get_doctor_svg_scene(4),
                "cognitive_bridge": (
                    "Every software release has its Davis: a VP or release manager shouting: 'We promised the CEO this goes live tonight at 8 PM! "
                    "Skip the regression suite and do a 5-minute sanity check!' "
                    "The novice panics, complies silently, and prays nothing explodes. "
                    "The master QA acts as Elena in OR 3. They don't throw an emotional tantrum; they assert calm, empirical risk governance. "
                    "They isolate the vital organs (billing, data integrity), quantify the blast radius, and execute a controlled, safe release."
                )
            },
            "concept_breakdown": (
                "Anyone can maintain composure when releases are calm and deadlines are far. "
                "True mindset is forged in the crucible: production is bleeding, executives want to deploy, developers are tired, "
                "and you hold the stethoscope. "
                "In the ER, doctors do not panic. They maintain calm, triage injuries by lethality, and enforce safety protocols without apology."
            ),
            "analogy_immersion": (
                "**The Courage of the White Coat:** When a surgeon is exhausted and tempted to close an incision without counting sponges, "
                "the surgical nurse has the legal and moral duty to call a 'Hard Stop'. As QA, you are that surgical nurse. "
                "You do not seek popularity; you protect the patient."
            ),
            "golden_axiom": "It is better to endure 30 minutes of executive frustration today than 3 weeks of catastrophic data breach cleanups tomorrow.",
            "reflection_prompt": "Can you articulately defend a release blocker without being adversarial, framing it in terms of patient health and corporate risk rather than personal opinion?",
            "scenario_drill": {
                "situation": "The VP of Engineering demands: 'We promised the CEO this release goes out tonight at 8 PM. We only have 1 hour left. Skip the regression suite and just do a 5-minute sanity check on the homepage.'",
                "question": "What is the master-level response?",
                "options": [
                    {
                        "id": "A",
                        "label": "Refuse angrily, accuse the VP of being irresponsible, and log off Slack.",
                        "mindset_alignment": "Adversarial & Ineffective",
                        "verdict": "FAIL: You created political hostility and failed to communicate risk in business terms."
                    },
                    {
                        "id": "B",
                        "label": "Silently obey, run the 5-minute check, and pray nothing explodes.",
                        "mindset_alignment": "Cowardly Compliance",
                        "verdict": "CRITICAL FAIL: You abandoned your duty. When payment checkout breaks at 9 PM, you will bear the consequence of false assurance."
                    },
                    {
                        "id": "C",
                        "label": "Calmly present an emergency triage matrix: 'Here are the 3 payment pathways altered by today's commit. If we deploy now without regression, there is an unmitigated 40% risk of transaction rollback. I propose running our automated P0 smoke suite (12 mins) to clear core billing, and holding non-critical modules for tomorrow morning.'",
                        "mindset_alignment": "Elite Strategic Partner",
                        "verdict": "MASTERCLASS: You operated as an executive trauma surgeon—triaging essential organs, quantifying exact risk, offering an actionable compromise, and maintaining patient safety."
                    }
                ]
            }
        },
        {
            "chapter_id": 5,
            "title": "Chapter 5: Mindset Synthesis & Daily Clinical Rounds",
            "subtitle": "Wiring the Diagnostic Reflex into Permanent Biological Habit",
            "story": {
                "act_title": "Act V: The Master's Morning Rounds",
                "setting": "Hospital Conservatory — 06:30 AM",
                "characters": "Dr. Elena Vance & Chief Executive Dr. Thorne",
                "narrative": (
                    "Dawn broke over the hospital courtyard. Dr. Thorne found Elena sitting with a warm cup of black coffee, "
                    "studying the hospital's aggregated telemetry charts from the past six months.\n\n"
                    "'You saved three lives last night, Elena,' Thorne said, leaning against the balcony rail. "
                    "'The board wants to know: what diagnostic software did you buy? What new AI machine did you install?'\n\n"
                    "Elena chuckled softly, shaking her head. 'None, Thorne. Tools change every two years. "
                    "When I started thirty years ago, we used manual mercury sphygmomanometers. Today we have optical lasers. "
                    "The tools are just machinery. What saved those patients was the habits of the mind:\n"
                    "1. Never trust silence as proof of health.\n"
                    "2. Treat every unexpected twitch as a hypothesis to be falsified.\n"
                    "3. Validate the human life, not the paperwork.\n\n"
                    "If you give a novice the most advanced AI diagnostic scanner in the world, they will still misdiagnose sepsis "
                    "because they don't have the mental model to question the scanner's assumptions.'"
                ),
                "svg_banner": get_doctor_svg_scene(5),
                "cognitive_bridge": (
                    "In the age of AI, automated test generation tools and LLM code-fixers are the equivalent of high-tech scanners. "
                    "They will write 1,000 unit tests in 10 seconds. "
                    "Yet they have no concept of customer emotion, architectural fragility, or risk trade-offs under business pressure. "
                    "Your value as a QA master is your **mindset**: your daily rounds, your preventative inquiry, and your unwavering integrity. "
                    "That is why mindset can never be automated."
                )
            },
            "concept_breakdown": (
                "Skills degrade or get automated by LLMs. Mindset compounds with age. "
                "An elite QA with 10 years of diagnostic instinct can spot an architectural vulnerability in 3 minutes of conversation "
                "with an architect, before a single line of code is written. "
                "This chapter provides the daily rituals to keep your diagnostic lens razor sharp."
            ),
            "analogy_immersion": (
                "**The Daily Rounds:** Great physicians do daily rounds, reading charts and observing patterns across all beds. "
                "As QA, your daily rounds include reviewing pull request diffs, reading customer support tickets, checking production APM dashboards, "
                "and keeping continuous situational awareness of systemic health."
            ),
            "golden_axiom": "Quality is not something you test into software at the end; it is an internal philosophy you weave into the culture from the beginning.",
            "reflection_prompt": "What is one assumption in your current project that everyone takes for granted, but nobody has actually verified with evidence?",
            "scenario_drill": {
                "situation": "You join a new team where developers rarely write tests, documentation is non-existent, and QA is treated as the 'cleanup crew' at the end of sprints.",
                "question": "How does the Mindset Master initiate cultural change?",
                "options": [
                    {
                        "id": "A",
                        "label": "Complain at every standup that the team lacks engineering discipline.",
                        "mindset_alignment": "Whining Novice",
                        "verdict": "FAIL: Negative noise that isolates you from the team."
                    },
                    {
                        "id": "B",
                        "label": "Introduce 'Preventative Medicine' micro-habits: pair with developers during feature design to define edge-case testability, share post-mortem root-cause lessons without blame, and celebrate preventative bug catches before PR merge.",
                        "mindset_alignment": "Culture Catalyst",
                        "verdict": "EXCELLENT: You transformed QA from a police force into a health consultation service, instilling the mindset across the entire organization."
                    }
                ]
            }
        }
    ]


def generate_curriculum(domain_intel, selected_analogy):
    """
    Generates 5 chapters connecting the domain to the chosen analogy with storytelling narratives.
    """
    domain_name = domain_intel.get("domain", "")
    analogy_title = selected_analogy.get("title", "")
    analogy_tier = selected_analogy.get("tier_label", "")

    # Check for our pre-compiled flagship QA Doctor curriculum
    if "quality assurance" in domain_name.lower() or "qa" in domain_name.lower():
        if "doctor" in analogy_title.lower() or "physician" in analogy_title.lower():
            return build_qa_doctor_curriculum()

    # Try LLM generation for arbitrary domains or other analogies
    prompt = f"""
    You are an elite cognitive mentor and master storyteller.
    Domain: "{domain_name}"
    Selected Analogy: "{analogy_title}" ({analogy_tier})
    Analogy Narrative: "{selected_analogy.get('narrative', '')}"

    Generate 5 progressive chapters to wire this specific mindset into human intuition using STORYTELLING:
    Chapter 1: The Perceptual Lens - Filtering Noise vs Spotting Subtle Signals
    Chapter 2: The Diagnostic Framework - Deconstructing Ambiguity & Tracing Root Causes
    Chapter 3: The Decision Calculus - Protocol vs Real Human Value
    Chapter 4: The Crucible - High-Stakes Crisis & Triage Under Pressure
    Chapter 5: Mindset Synthesis - Lifelong Mental Reflexes in the Era of AI

    For EACH chapter, provide:
    - chapter_id (1 to 5)
    - title
    - subtitle
    - story: {{
        "act_title": "Dramatic scene title",
        "setting": "Atmospheric physical location and time",
        "characters": "Names and roles",
        "narrative": "A gripping 3-paragraph narrative showing an intense real-world dilemma solved through this mindset",
        "cognitive_bridge": "Explicit explanation connecting the story scene directly to professional decision-making"
      }}
    - concept_breakdown
    - analogy_immersion
    - golden_axiom
    - reflection_prompt
    - scenario_drill: {{
        "situation": "High-pressure real dilemma",
        "question": "What does the master do?",
        "options": [
          {{"id": "A", "label": "...", "mindset_alignment": "Novice", "verdict": "..."}},
          {{"id": "B", "label": "...", "mindset_alignment": "Master Mindset", "verdict": "..."}}
        ]
      }}

    Return strictly a valid JSON array of 5 chapter objects.
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
            if isinstance(data, list) and len(data) >= 3:
                return data
            if isinstance(data, dict) and "chapters" in data:
                return data["chapters"]
        except Exception as e:
            print(f"[Curriculum Generator] LLM parsing error: {e}")

    # Robust fallback curriculum generator using domain_intel & analogy
    chapters = []
    titles = [
        ("The Perceptual Lens", "Filtering Noise and Spotting Latent Patterns", "Act I: The Signal in the Static"),
        ("The Diagnostic Framework", "Deconstructing Ambiguity & Tracing Root Causes", "Act II: The Hidden Fracture"),
        ("The Decision Calculus", "Protocol Compliance vs True Human Outcome", "Act III: The Letter of the Law"),
        ("The Crucible", "Triage Under Extreme Pressure & Crisis Governance", "Act IV: The Midnight Dilemma"),
        ("Mindset Synthesis & Mastery", "Involuntary Muscle Memory in the Age of AI", "Act V: The Master's Reflex")
    ]
    for i, (t_main, t_sub, act_name) in enumerate(titles, 1):
        chapters.append({
            "chapter_id": i,
            "title": f"Chapter {i}: {t_main}",
            "subtitle": f"{t_sub} through {analogy_title}",
            "story": {
                "act_title": act_name,
                "setting": f"Field Command Center — Stage {i}",
                "characters": f"Senior Practitioner & Junior Apprentice in {domain_name}",
                "narrative": (
                    f"A sudden anomaly appeared on the telemetry dashboard. While all automated indicators reported green, "
                    f"the Senior Practitioner noticed a subtle temporal drift. 'Look at that micro-oscillation,' they said. "
                    f"'A novice trusts the green status; a master questions whether the measurement apparatus itself is misaligned.'\n\n"
                    f"By intervening before the threshold breached, they averted a catastrophic cascading failure."
                ),
                "cognitive_bridge": f"In {domain_name}, this scene represents the shift from mechanical checklist checking to deep cognitive situational awareness."
            },
            "concept_breakdown": (
                f"In {domain_name}, novices depend on rigid checklists, while masters utilize high-dimensional mental models. "
                f"When faced with novel challenges, an expert immediately anchors themselves to first-principles intuition."
            ),
            "analogy_immersion": (
                f"Through the lens of **{analogy_title}**, this stage represents mastering the sensory tools and diagnostic instruments. "
                f"Just as {selected_analogy.get('character_role', 'an expert')} reads faint environmental cues, "
                f"you learn to discern critical operational signals from background noise in {domain_name}."
            ),
            "golden_axiom": f"In {domain_name}, procedural compliance without cognitive discernment is a recipe for catastrophic blindness.",
            "reflection_prompt": f"Where in your current practice of {domain_name} are you relying on mechanical habit rather than active inquiry?",
            "scenario_drill": {
                "situation": f"A major conflict arises in {domain_name} where conventional guidelines give contradictory advice under severe time constraints.",
                "question": "How does the true Mindset Master proceed?",
                "options": [
                    {
                        "id": "A",
                        "label": "Wait for executive direction or defer responsibility to avoid taking personal risk.",
                        "mindset_alignment": "Bureaucratic Risk Aversion",
                        "verdict": "FAIL: You stalled critical momentum and allowed systemic entropy to escalate."
                    },
                    {
                        "id": "B",
                        "label": "Apply first-principles triage: isolate highest-consequence blast radiuses, communicate objective risk probabilities, and execute a reversible containment action.",
                        "mindset_alignment": "Master Mindset",
                        "verdict": "EXCELLENT: You demonstrated true leadership and composure, grounding your decision in core invariants rather than panicked dogmatism."
                    }
                ]
            }
        })
    return chapters
