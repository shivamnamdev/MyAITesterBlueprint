#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "⚡ Starting Ultimate Prompt Generator (B.L.A.S.T.)"
echo "========================================================"

# Look for virtualenv in project directory or parent projects
if [ -d ".venv" ]; then
    PYTHON_BIN=".venv/bin/python"
elif [ -d "../Project5-CaludeCodeBugReport/.venv" ]; then
    PYTHON_BIN="../Project5-CaludeCodeBugReport/.venv/bin/python"
elif [ -d "../../Project5-CaludeCodeBugReport/.venv" ]; then
    PYTHON_BIN="../../Project5-CaludeCodeBugReport/.venv/bin/python"
else
    echo "Creating local Python virtual environment (.venv)..."
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt
    PYTHON_BIN=".venv/bin/python"
fi

export PORT="${PORT:-5056}"

echo "📍 Python interpreter: $PYTHON_BIN"
echo "🌐 Launching Web UI at http://localhost:$PORT"
echo "========================================================"

exec "$PYTHON_BIN" app.py

