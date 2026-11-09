"""Mindset Builder Agent - Web Application Server.
A Gemini/ChatGPT-styled cognitive coaching portal with a flowing neural network canvas.
Built on the B.L.A.S.T. protocol.
"""
import io
import os
import sys

# Ensure project directory is in python search path
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from flask import Flask, jsonify, render_template, request, send_file
from tools.verify_env import load_env, run_checks
from tools.domain_analyzer import KNOWN_DOMAINS
from tools.orchestrator import (
    initialize_mindset_session,
    select_analogy_and_build_curriculum,
    handle_socratic_chat,
    export_mindset_dossier_markdown
)

load_env()

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
PORT = int(os.environ.get("PORT", 5095))


@app.route("/")
def index():
    """Render the Mindset Builder Agent chatbot portal."""
    featured_domains = [
        {"id": "qa", "name": "QA Engineering & Testing", "badge": "ISTQB • Doctor Analogy"},
        {"id": "devops", "name": "DevOps & SRE", "badge": "DORA • F1 Pit / Power Grid"},
        {"id": "product", "name": "Product Strategy", "badge": "Jobs-To-Be-Done • SVPG"},
        {"id": "security", "name": "Cybersecurity & Threat Defense", "badge": "CISSP • Zero Trust"},
        {"id": "prompt", "name": "AI Prompt Engineering", "badge": "Latent Space • Cognitive Scaffolding"}
    ]
    return render_template("index.html", featured_domains=featured_domains)


@app.route("/api/health", methods=["GET"])
def health():
    """System health and LLM provider telemetry."""
    checks = run_checks()
    return jsonify(checks)


@app.route("/api/domain/analyze", methods=["POST"])
def analyze_domain_endpoint():
    """Step 1 & 2: Ingests user domain and returns intelligence + 3 analogies."""
    try:
        data = request.get_json(force=True) or {}
        domain_query = data.get("domain", "").strip()
        if not domain_query:
            return jsonify({
                "status": "error",
                "message": "Please specify a field, subject, or profession (e.g. 'QA Mindset', 'DevOps', 'Product Manager')."
            }), 400

        result = initialize_mindset_session(domain_query)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/api/curriculum/build", methods=["POST"])
def build_curriculum_endpoint():
    """Step 3: Builds the 5-chapter interactive curriculum based on chosen analogy."""
    try:
        data = request.get_json(force=True) or {}
        domain_intel = data.get("domain_intel")
        analogy_key = data.get("analogy_key", "easy")
        custom_analogy = data.get("custom_analogy")

        if not domain_intel:
            return jsonify({
                "status": "error",
                "message": "domain_intel payload is required."
            }), 400

        result = select_analogy_and_build_curriculum(domain_intel, analogy_key, custom_analogy)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    """Interactive Socratic chat turn."""
    try:
        data = request.get_json(force=True) or {}
        domain_intel = data.get("domain_intel", {})
        selected_analogy = data.get("selected_analogy", {})
        user_message = data.get("message", "").strip()
        conversation_history = data.get("history", [])

        if not user_message:
            return jsonify({
                "status": "error",
                "message": "Message content cannot be empty."
            }), 400

        result = handle_socratic_chat(domain_intel, selected_analogy, user_message, conversation_history)
        return jsonify({
            "status": "success",
            **result
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/api/export", methods=["POST"])
def export_endpoint():
    """Exports full Mindset Dossier as a downloadable Markdown file."""
    try:
        data = request.get_json(force=True) or {}
        domain_intel = data.get("domain_intel", {})
        selected_analogy = data.get("selected_analogy", {})
        curriculum = data.get("curriculum", [])

        markdown_content = export_mindset_dossier_markdown(domain_intel, selected_analogy, curriculum)
        domain_slug = domain_intel.get("domain", "mindset").lower().replace(" ", "_")[:30]
        filename = f"{domain_slug}_mindset_blueprint.md"

        buf = io.BytesIO()
        buf.write(markdown_content.encode("utf-8"))
        buf.seek(0)

        return send_file(
            buf,
            as_attachment=True,
            download_name=filename,
            mimetype="text/markdown"
        )
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    print(f"==================================================")
    print(f"🧠 Mindset Builder Agent running at http://localhost:{PORT}")
    print(f"==================================================")
    app.run(host="0.0.0.0", port=PORT, debug=False)

