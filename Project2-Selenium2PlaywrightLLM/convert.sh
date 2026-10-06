#!/usr/bin/env bash
# ==============================================================================
# convert.sh - Selenium Java to Playwright TypeScript Converter CLI Runner
# Protocol: B.L.A.S.T. Phase 5 Trigger
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PYTHON_BIN="python3"

# Default configuration
DEFAULT_OUTPUT="playwright_output"
DEFAULT_MODEL="codellama:latest"

usage() {
  echo "Usage: ./convert.sh <path-to-java-file-or-folder> [output-dir] [ollama-model]"
  echo ""
  echo "Examples:"
  echo "  ./convert.sh ATB4xSeleniumAdvanceFramework/src/main/java/com/thetestingacademy/pages/PageObjectModel/LoginPage_POM.java"
  echo "  ./convert.sh ATB4xSeleniumAdvanceFramework/src playwright_output codellama:latest"
  exit 1
}

if [ -z "$1" ]; then
  echo "❌ Error: Please specify a target Java file or project directory."
  usage
fi

TARGET_PATH="$1"
OUTPUT_DIR="${2:-$DEFAULT_OUTPUT}"
MODEL="${3:-$DEFAULT_MODEL}"

echo "============================================================"
echo "🚀 B.L.A.S.T. Selenium Java -> Playwright TS Converter"
echo "============================================================"
echo "🎯 Input Target: $TARGET_PATH"
echo "📁 Output Folder: $OUTPUT_DIR"
echo "🤖 Ollama Model: $MODEL"
echo "============================================================"

# Step 1: Check Ollama connectivity
echo "🔍 Checking local Ollama service status..."
$PYTHON_BIN "$SCRIPT_DIR/tools/check_ollama.py"

# Step 2: Execute conversion pipeline
echo ""
echo "⚙️ Executing conversion pipeline..."
$PYTHON_BIN "$SCRIPT_DIR/tools/converter_cli.py" "$TARGET_PATH" --output "$OUTPUT_DIR" --model "$MODEL"

echo ""
echo "🎉 Conversion and stylization complete! Converted files are ready in '$OUTPUT_DIR'."
