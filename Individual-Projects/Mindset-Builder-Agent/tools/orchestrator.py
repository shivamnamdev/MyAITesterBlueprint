"""Mindset Orchestrator - Layer 2 Navigation Engine.
Coordinates Domain Ingestion, Tri-Tier Analogies, Chapter Curriculum,
Interactive Chat Turns, and Mindset Dossier generation.
"""
import json
import os
import sys

# Ensure directory is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from tools.domain_analyzer import analyze_domain
from tools.analogy_engine import generate_analogies_for_domain
from tools.curriculum_generator import generate_curriculum
from tools.llm_client import generate_llm_response


def initialize_mindset_session(domain_query):
    """
    Step 1 & 2: Analyzes the domain and creates the 3 analogies.
    """
    domain_intel = analyze_domain(domain_query)
    analogies = generate_analogies_for_domain(domain_intel)

    return {
        "status": "success",
        "domain_intel": domain_intel,
        "analogies": analogies
    }


def select_analogy_and_build_curriculum(domain_intel, analogy_key, custom_analogy=None):
    """
    Step 3: Builds the 5-chapter interactive curriculum based on the chosen analogy.
    """
    analogies = generate_analogies_for_domain(domain_intel)
    selected_analogy = custom_analogy or analogies.get(analogy_key) or analogies.get("easy")
    curriculum = generate_curriculum(domain_intel, selected_analogy)

    return {
        "status": "success",
        "selected_analogy": selected_analogy,
        "curriculum": curriculum
    }


def handle_socratic_chat(domain_intel, selected_analogy, user_message, conversation_history=None):
    """
    Interactive Chatbot Turn (Gemini/ChatGPT styled).
    Responds as the Master Mindset Mentor, grounding advice in the chosen analogy.
    """
    domain_name = domain_intel.get("domain", "General Field")
    analogy_title = selected_analogy.get("title", "The Master Diagnostic Analogy")
    character_role = selected_analogy.get("character_role", "Master Mentor")
    tagline = selected_analogy.get("tagline", "")

    history_str = ""
    if conversation_history and isinstance(conversation_history, list):
        for turn in conversation_history[-6:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            history_str += f"{role.upper()}: {content}\n"

    system_instruction = f"""
    You are the Master Mindset Mentor for '{domain_name}'.
    Your mission is NOT merely to teach mechanical tools or procedural syntax, but to wire the DEEP EXPERT COGNITIVE MINDSET.
    Anchor your teaching, intuition, and mental models in the chosen analogy: '{analogy_title}' ({character_role}).
    Analogy Theme: {tagline}

    Pedagogical Guidelines:
    1. Always bridge the user's question back to first-principles thinking and the '{analogy_title}' paradigm.
    2. Point out the difference between a novice checklist-follower vs an elite first-principles thinker.
    3. Be encouraging yet intellectually rigorous—challenge superficial assumptions.
    4. Keep answers engaging, structured, using vivid analogies and clear real-world examples.
    """

    prompt = f"""
    {history_str}
    USER: {user_message}
    MENTOR:
    """

    llm_resp, provider = generate_llm_response(prompt, system_instruction=system_instruction)
    if llm_resp:
        return {
            "reply": llm_resp,
            "provider": provider
        }

    # Deterministic fallback response tailored to the domain and analogy
    fallback_reply = (
        f"### The Mindset Perspective ({analogy_title})\n\n"
        f"In **{domain_name}**, what separates top 10% performers from everyone else is not knowing more commands, "
        f"but **how they frame problems through their mental models**.\n\n"
        f"When you examine this through the lens of **{analogy_title}**, consider:\n\n"
        f"1. **Surface Symptom vs Underlying Truth:** When novices encounter friction, they apply quick patches. "
        f"As **{character_role}**, your instinct must be to trace the symptom back to the systemic root cause.\n"
        f"2. **The First-Principles Filter:** Ask yourself: *'What fundamental invariant is being violated here?'*\n"
        f"3. **Resilience under Uncertainty:** In an era where AI handles mechanical code generation in seconds, "
        f"your unique value lies in spotting the unexamined assumptions and risk vectors that no algorithm noticed.\n\n"
        f"**Next Step Challenge:** Look at the scenario you are facing right now. If you were viewing it as a life-or-death diagnosis, "
        f"what vital sign would you measure first before taking action?"
    )
    return {
        "reply": fallback_reply,
        "provider": "deterministic_expert_engine"
    }


def export_mindset_dossier_markdown(domain_intel, selected_analogy, curriculum):
    """
    Generates a comprehensive Markdown Master Dossier for the user to download or save.
    """
    domain = domain_intel.get("domain", "Domain")
    lines = [
        f"# 🧠 Master Mindset Blueprint: {domain}",
        f"**Epistemic Category:** {domain_intel.get('category', 'Engineering')}",
        f"**Core Purpose:** {domain_intel.get('tagline', '')}",
        "",
        "---",
        "",
        "## 💎 First Principles (Unbreakable Axioms)",
    ]
    for p in domain_intel.get("first_principles", []):
        lines.append(f"- **{p}**")

    lines.extend([
        "",
        "## 📜 Industry Certifications & Bodies of Knowledge",
    ])
    for s in domain_intel.get("syllabi_and_standards", []):
        lines.append(f"- {s}")

    evn = domain_intel.get("expert_vs_novice_mindset", {})
    lines.extend([
        "",
        "## ⚡ Novice vs. Master Cognitive Contrast",
        f"- **Novice / Procedural:** {evn.get('novice', '')}",
        f"- **Master / First-Principles:** {evn.get('expert', '')}",
        "",
        "## 🔬 Why Mindset Beats Skill in the Era of AI",
        f"{domain_intel.get('why_mindset_beats_skill', '')}",
        "",
        "---",
        "",
        f"## 🎯 Chosen Anchor Analogy: {selected_analogy.get('title', '')} ({selected_analogy.get('tier_label', '')})",
        f"*{selected_analogy.get('tagline', '')}*",
        "",
        selected_analogy.get("narrative", ""),
        "",
        "### Cognitive Mapping Table",
        "| Domain Concept | Analogy Counterpart | Intuitive Mental Model |",
        "|---|---|---|",
    ])
    for m in selected_analogy.get("mapping", []):
        lines.append(f"| {m.get('domain_concept')} | {m.get('analogy_counterpart')} | {m.get('intuition')} |")

    lines.extend([
        "",
        "---",
        "",
        "## 📚 5-Chapter Mindset Curriculum & Scenario Drills",
    ])
    for ch in curriculum:
        lines.extend([
            f"### {ch.get('title')}",
            f"*{ch.get('subtitle')}*",
            "",
            ch.get("concept_breakdown", ""),
            "",
            f"> [!IMPORTANT]",
            f"> **Analogy Immersion:** {ch.get('analogy_immersion', '')}",
            "",
            f"**Golden Axiom:** *{ch.get('golden_axiom', '')}*",
            "",
            f"**Reflection:** {ch.get('reflection_prompt', '')}",
            "",
        ])
        drill = ch.get("scenario_drill")
        if drill:
            lines.extend([
                "#### ⚔️ Scenario Drill",
                f"**Situation:** {drill.get('situation', '')}",
                f"**Challenge:** {drill.get('question', '')}",
                "",
            ])
            for opt in drill.get("options", []):
                lines.append(f"- **Option {opt.get('id')}:** {opt.get('label')}")
                lines.append(f"  *Alignment:* `{opt.get('mindset_alignment')}` — {opt.get('verdict')}")
            lines.append("")

    return "\n".join(lines)

