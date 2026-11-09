"""Verify environment and connectivity for Mindset Builder Agent."""
import os
import sys
import json
import urllib.request
import urllib.error

# Ensure directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)


def load_env(env_path=None):
    """Zero-dependency .env loader."""
    if env_path is None:
        env_path = os.path.join(PROJECT_DIR, ".env")
    if not os.path.exists(env_path):
        return {}
    loaded = {}
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip().strip("\"'")
            os.environ.setdefault(k, v)
            loaded[k] = v
    return loaded


def verify_ollama(host="http://localhost:11434"):
    """Check if local Ollama daemon is reachable."""
    try:
        url = f"{host.rstrip('/')}/api/tags"
        req = urllib.request.Request(url, headers={"User-Agent": "MindsetBuilder/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("name") for m in data.get("models", [])]
                return True, models
    except Exception:
        pass
    return False, []


def verify_gemini(api_key):
    """Check if Gemini API key is configured."""
    if not api_key or api_key == "your_gemini_api_key_here" or len(api_key) < 10:
        return False, "GEMINI_API_KEY is not set or placeholder"
    return True, "GEMINI_API_KEY is present"


def run_checks():
    """Run all connectivity and environment checks."""
    load_env()
    port = os.environ.get("PORT", "5090")
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

    gemini_ok, gemini_msg = verify_gemini(gemini_key)
    ollama_ok, ollama_models = verify_ollama(ollama_host)

    report = {
        "status": "online",
        "port": port,
        "providers": {
            "gemini": {
                "active": gemini_ok,
                "message": gemini_msg
            },
            "ollama": {
                "active": ollama_ok,
                "models": ollama_models
            },
            "deterministic_expert_engine": {
                "active": True,
                "message": "Built-in offline heuristic knowledge base ready"
            }
        }
    }
    return report


if __name__ == "__main__":
    report = run_checks()
    print(json.dumps(report, indent=2))

