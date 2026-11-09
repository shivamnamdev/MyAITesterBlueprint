#!/usr/bin/env bash
# start.sh — One-click launcher for TestPlan AI Agent (Project 7)
set -e

PORT="${PORT:-5080}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "🧪 Launching TestPlan AI Agent (JIRA + Multi-LLM)"
echo "=========================================================="

# 1. Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed or not in PATH."
  exit 1
fi

# 2. Check dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing project dependencies..."
  npm install
fi

# 3. Always rebuild React UI to ensure latest dist assets
echo "⚙️ Building React frontend UI..."
npm run build

# 4. Check if port is already in use and free it
if lsof -ti :$PORT > /dev/null 2>&1; then
  echo "⚠️  Freeing occupied port $PORT..."
  kill -9 $(lsof -ti :$PORT) 2>/dev/null || true
  sleep 1
fi

echo "🚀 Starting TestPlan AI Agent on http://localhost:$PORT"
echo "🌐 UI & API served concurrently on port $PORT"
echo "🤖 Supported LLMs: Anthropic Claude (Opus, Sonnet, Haiku), Ollama (Local), Gemini"
echo "🔗 JIRA Credentials: Configure directly via the UI or in .env"
echo "----------------------------------------------------------"

PORT=$PORT node server/index.js
