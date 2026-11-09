"""LLM Gateway for Mindset Builder Agent.
Supports Google Gemini, Local Ollama, and Deterministic Fallback.
"""
import json
import os
import sys
import urllib.error
import urllib.request

# Ensure directory is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from tools.verify_env import load_env

load_env()


def call_gemini(prompt, system_instruction=None, json_mode=False):
    """Call Google Gemini REST API using GEMINI_API_KEY."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here" or len(api_key) < 10:
        return None

    model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    contents = []
    if system_instruction:
        contents.append({
            "role": "user",
            "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Understood. I will strictly adhere to these instructions."}]
        })

    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2500
        }
    }
    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
    except Exception as e:
        print(f"[LLM Gateway] Gemini error: {e}")
        return None
    return None


def call_ollama(prompt, system_instruction=None, json_mode=False):
    """Call local Ollama server if running."""
    host = os.environ.get("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
    model = os.environ.get("OLLAMA_MODEL", "llama3.2")
    url = f"{host}/api/generate"

    full_prompt = prompt
    if system_instruction:
        full_prompt = f"System: {system_instruction}\n\nUser: {prompt}"

    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.3
        }
    }
    if json_mode:
        payload["format"] = "json"

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            return res_data.get("response", "")
    except Exception:
        return None


def generate_llm_response(prompt, system_instruction=None, json_mode=False):
    """Unified LLM call: Gemini -> Ollama -> None."""
    # 1. Try Gemini
    resp = call_gemini(prompt, system_instruction, json_mode)
    if resp:
        return resp, "gemini"

    # 2. Try Ollama
    resp = call_ollama(prompt, system_instruction, json_mode)
    if resp:
        return resp, "ollama"

    return None, "fallback"

