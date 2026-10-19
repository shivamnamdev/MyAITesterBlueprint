"""Chat-driven Bug Report Generator.

The user describes a bug in plain language in the chat; a local LLM (Ollama)
turns the conversation into a structured bug report that is rendered live.
If Ollama is not reachable, a simple rule-based extractor is used instead.
"""
import json
import os
import re
from datetime import datetime

import requests
from flask import Flask, jsonify, render_template, request

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")

app = Flask(__name__)

EMPTY_REPORT = {
    "title": "",
    "severity": "",
    "priority": "",
    "component": "",
    "environment": "",
    "summary": "",
    "steps": [],
    "expected": "",
    "actual": "",
    "workaround": "",
    "notes": "",
}

SYSTEM_PROMPT = """You are a senior QA engineer helping a user write a bug report through chat.
Each turn you receive the conversation and the CURRENT report. Update the report using
everything the user has said and reply briefly (max 2 sentences), asking at most one
follow-up question about the most important missing detail (steps, expected/actual, environment).
Respond ONLY with JSON of this exact shape:
{"reply": "...", "report": {"title": "", "severity": "Critical|High|Medium|Low", "priority": "P1|P2|P3|P4",
"component": "", "environment": "", "summary": "", "steps": ["..."], "expected": "", "actual": "",
"workaround": "", "notes": ""}}
Rules: never invent facts the user did not give (leave the field "" or [] instead); keep the title
under 80 chars and specific; steps are short imperative sentences; infer severity/priority only
from stated impact; keep earlier report content unless the user corrects it."""


def merge_report(current, update):
    """Overlay non-empty fields of `update` on `current`, keeping the schema fixed."""
    merged = dict(EMPTY_REPORT)
    merged.update(current or {})
    for key in EMPTY_REPORT:
        value = (update or {}).get(key)
        if key == "steps":
            if isinstance(value, list) and value:
                merged[key] = [str(s).strip() for s in value if str(s).strip()]
        elif isinstance(value, str) and value.strip():
            merged[key] = value.strip()
    return merged


def llm_turn(messages, report):
    convo = [{"role": "system", "content": SYSTEM_PROMPT}]
    convo.append({"role": "system", "content": "CURRENT REPORT: " + json.dumps(report)})
    convo += [m for m in messages if m.get("role") in ("user", "assistant")]
    resp = requests.post(
        OLLAMA_URL + "/api/chat",
        json={"model": OLLAMA_MODEL, "messages": convo, "stream": False, "format": "json"},
        timeout=120,
    )
    resp.raise_for_status()
    data = json.loads(resp.json()["message"]["content"])
    return data.get("reply", "Report updated."), merge_report(report, data.get("report"))


def fallback_turn(messages, report):
    """Very small rule-based extractor used when no LLM is available."""
    text = messages[-1]["content"].strip()
    update = {}
    lowered = text.lower()

    steps = re.findall(r"(?:^|\n)\s*(?:\d+[.)]|[-*])\s*(.+)", text)
    if steps:
        update["steps"] = steps
    for label, key in (("expected", "expected"), ("actual", "actual"), ("environment", "environment"),
                       ("workaround", "workaround"), ("component", "component")):
        m = re.search(label + r"\s*(?:result|behaviou?r)?\s*[:\-]\s*(.+)", text, re.I)
        if m:
            update[key] = m.group(1).strip()
    for sev in ("critical", "high", "medium", "low"):
        if re.search(r"\b" + sev + r"\b", lowered):
            update["severity"] = sev.capitalize()
            break
    if not update.get("severity") and re.search(r"crash|data loss|cannot login|can't login|security", lowered):
        update["severity"] = "High"

    if not report.get("summary"):
        update["summary"] = text.split("\n")[0]
        update["title"] = text.split("\n")[0][:80]
    elif not steps and not any(k in update for k in ("expected", "actual", "environment")):
        update["notes"] = (report.get("notes", "") + "\n" + text).strip()

    merged = merge_report(report, update)
    reply = "Noted (offline mode: start Ollama for smarter reports)."
    if not merged["steps"]:
        reply += " What are the steps to reproduce?"
    elif not merged["expected"] or not merged["actual"]:
        reply += " What did you expect and what actually happened?"
    return reply, merged


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/chat")
def chat():
    body = request.get_json(force=True)
    messages = body.get("messages", [])
    report = merge_report({}, body.get("report"))
    if not messages:
        return jsonify(error="No messages"), 400
    try:
        reply, report = llm_turn(messages, report)
        engine = OLLAMA_MODEL
    except (requests.RequestException, ValueError, KeyError):
        reply, report = fallback_turn(messages, report)
        engine = "offline"
    report["generated"] = datetime.now().strftime("%d %b %Y, %H:%M")
    return jsonify(reply=reply, report=report, engine=engine)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5055)), debug=False)
