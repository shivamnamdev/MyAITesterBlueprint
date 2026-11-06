"""LLM Client for Ultimate Prompt Generator.

Handles connectivity to local Ollama API and Google Gemini API,
using Generator-Prompt.txt as the foundational system prompt.
"""
import json
import os
from typing import Any, Dict, Optional, Tuple

import requests
from tools.prompt_compiler import compile_prompt, generate_title

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Load the master instruction from Generator-Prompt.txt
PROMPT_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "Generator-Prompt.txt"
)

try:
    with open(PROMPT_FILE_PATH, "r", encoding="utf-8") as f:
        MASTER_SYSTEM_INSTRUCTION = f.read()
except Exception:
    MASTER_SYSTEM_INSTRUCTION = "Act as an elite Prompt Engineer, AI Workflow Architect, and Subject-Matter Expert."


def check_ollama_health(host: str = OLLAMA_HOST) -> Tuple[bool, list]:
    """Check if local Ollama daemon is active and return available models."""
    try:
        resp = requests.get(f"{host.rstrip('/')}/api/tags", timeout=2)
        if resp.status_code == 200:
            models_data = resp.json().get("models", [])
            models = [m.get("name") for m in models_data if "name" in m]
            return True, models
    except Exception:
        pass
    return False, []


def generate_with_ollama(
    data: Dict[str, Any],
    model: str = DEFAULT_OLLAMA_MODEL,
    host: str = OLLAMA_HOST,
) -> Dict[str, Any]:
    """Generate an Ultimate Master Prompt using local Ollama model."""
    topic = data.get("topic", "").strip()
    role = data.get("targetRole", "").strip()
    tech_stack = data.get("techStack", [])
    experience = data.get("experienceLevel", "Intermediate")
    constraints = data.get("constraints", "")
    time_commitment = data.get("timeCommitment", "")

    user_brief = f"""Please create an Ultimate Master Prompt for the following subject:
Topic / Goal: {topic}
Desired Expert Role: {role}
Target Tech Stack / Ecosystem: {tech_stack}
My Current Experience Level: {experience}
Time Commitment: {time_commitment}
Constraints & Do-Not Rules: {constraints}

Follow all 10 Prompt Engineering Principles and the 17-Section Structure defined in your master instructions. Produce the complete, copy-ready Ultimate Master Prompt in clean Markdown format."""

    messages = [
        {"role": "system", "content": MASTER_SYSTEM_INSTRUCTION},
        {"role": "user", "content": user_brief},
    ]

    try:
        resp = requests.post(
            f"{host.rstrip('/')}/api/chat",
            json={
                "model": model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.4,
                    "num_ctx": 4096,
                },
            },
            timeout=120,
        )
        resp.raise_for_status()
        content = resp.json().get("message", {}).get("content", "").strip()

        if not content:
            raise ValueError("Ollama returned empty response.")

        title = generate_title(topic, role or "Specialist")
        word_count = len(content.split())

        return {
            "status": "success",
            "title": title,
            "generatedPrompt": content,
            "metadata": {
                "engineUsed": f"ollama ({model})",
                "sectionCount": 17,
                "wordCount": word_count,
                "charCount": len(content),
            },
            "clarifyingQuestion": None,
            "error": None,
        }
    except Exception as e:
        # Fall back to deterministic compiler
        fallback_res = compile_prompt(data)
        fallback_res["metadata"]["engineUsed"] = f"deterministic (fallback from ollama: {str(e)})"
        return fallback_res


def generate_prompt_unified(data: Dict[str, Any]) -> Dict[str, Any]:
    """Unified entry point: routes to deterministic compiler or Ollama based on request."""
    engine = (data.get("engine") or "deterministic").lower()

    if engine == "ollama":
        model = data.get("ollamaModel") or DEFAULT_OLLAMA_MODEL
        is_healthy, _ = check_ollama_health()
        if not is_healthy:
            # Fall back to deterministic compiler
            res = compile_prompt(data)
            res["metadata"]["engineUsed"] = "deterministic (Ollama is currently offline at localhost:11434)"
            return res
        return generate_with_ollama(data, model=model)

    # Default: deterministic compiler
    return compile_prompt(data)

