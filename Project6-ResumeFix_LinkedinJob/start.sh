#!/usr/bin/env bash
set -e

# Job Tracking Board Assistant - Launcher
PORT="${PORT:-5070}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "🎯 Launching Job Tracking Board Assistant & AI Matcher"
echo "=========================================================="

# Check node
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed or not in PATH."
  exit 1
fi

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing project dependencies..."
  npm install
fi

# Build frontend if dist doesn't exist
if [ ! -d "dist" ]; then
  echo "⚙️ Building React Kanban frontend..."
  npm run build
fi

echo "🚀 Starting Assistant Server on http://localhost:$PORT"
echo "🌐 Local SQLite Database: data/jobs.db"
echo "🤖 Ollama AI Detection: http://localhost:11434 (Auto-fallback to Heuristics if offline)"
echo "----------------------------------------------------------"

PORT=$PORT node server/server.js

