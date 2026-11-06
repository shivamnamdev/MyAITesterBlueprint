"""Ultimate Prompt Generator - Web Application Server.

A web application built on the B.L.A.S.T. protocol that converts
user requirements into comprehensive 17-section Master Prompts.
"""
import io
import os
import sys

# Ensure current directory is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, render_template, request, send_file
from tools.llm_client import check_ollama_health, generate_prompt_unified
from tools.prompt_compiler import ALL_SECTIONS, PRESETS, compile_prompt

app = Flask(__name__)
PORT = int(os.environ.get("PORT", 5056))


@app.route("/")
def index():
    """Render the master prompt generation web UI."""
    return render_template(
        "index.html",
        presets=PRESETS,
        sections=ALL_SECTIONS,
    )


@app.route("/api/health", methods=["GET"])
def health():
    """System health check and local Ollama status."""
    ollama_ok, models = check_ollama_health()
    return jsonify({
        "status": "healthy",
        "service": "Ultimate Prompt Generator",
        "protocol": "B.L.A.S.T.",
        "ollama": {
            "online": ollama_ok,
            "models": models,
        },
    })


@app.route("/api/presets", methods=["GET"])
def get_presets():
    """Return pre-configured templates for common domains."""
    return jsonify(PRESETS)


@app.route("/api/generate", methods=["POST"])
def generate():
    """API endpoint to generate the Ultimate Master Prompt."""
    try:
        data = request.get_json(force=True) or {}
        if not data.get("topic") or not str(data.get("topic")).strip():
            return jsonify({
                "status": "error",
                "error": "A topic, domain goal, or project name is required.",
            }), 400

        result = generate_prompt_unified(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
        }), 500


@app.route("/api/download", methods=["POST"])
def download():
    """Download the generated prompt as .md or .txt file."""
    try:
        data = request.get_json(force=True) or {}
        content = data.get("content", "")
        filename = data.get("filename", "Ultimate_Master_Prompt.md")
        file_format = data.get("format", "md").lower()

        if not filename.endswith(f".{file_format}"):
            filename = f"{filename}.{file_format}"

        buffer = io.BytesIO()
        buffer.write(content.encode("utf-8"))
        buffer.seek(0)

        mimetype = "text/markdown" if file_format == "md" else "text/plain"
        return send_file(
            buffer,
            as_attachment=True,
            download_name=filename,
            mimetype=mimetype,
        )
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 65)
    print("🚀 Ultimate Prompt Generator Web Server (B.L.A.S.T.)")
    print(f"📍 Access Web UI at: http://localhost:{PORT}")
    print("=" * 65)
    app.run(host="0.0.0.0", port=PORT, debug=True)

