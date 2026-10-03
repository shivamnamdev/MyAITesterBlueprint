# Project Constitution & Data Schemas

## Project Vision & Architecture
- **North Star**: Local LLM Testcase generator driven by user input using a built-in prompt template and the Ollama API with `llama3.2`.
- **Integrations**: Ollama local server API (`http://localhost:11434`).
- **UI Delivery**: Interactive Web Chat UI for entering feature descriptions and displaying structured test cases.

## Behavioral Rules
- Prioritize reliability, determinism, and structure.
- Never invent unrequested external dependencies.
- Validate LLM outputs against strict JSON schemas before rendering in UI.

## Data Schemas

### 1. Generation Input Request Payload Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "feature_description": {
      "type": "string",
      "description": "User input describing the feature or requirement to generate test cases for."
    },
    "test_type": {
      "type": "string",
      "enum": ["All", "Functional", "Negative", "Security", "UI/UX", "Edge Cases"],
      "default": "All"
    },
    "model": {
      "type": "string",
      "default": "llama3.2"
    }
  },
  "required": ["feature_description"]
}
```

### 2. Testcase Output Schema (JSON response from LLM / system payload)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "feature_name": { "type": "string" },
    "summary": { "type": "string" },
    "test_cases": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "example": "TC-001" },
          "title": { "type": "string" },
          "type": { "type": "string", "enum": ["Functional", "Negative", "Boundary", "Security", "UI/UX", "Performance"] },
          "priority": { "type": "string", "enum": ["P0", "P1", "P2", "P3"] },
          "preconditions": {
            "type": "array",
            "items": { "type": "string" }
          },
          "steps": {
            "type": "array",
            "items": { "type": "string" }
          },
          "expected_result": { "type": "string" }
        },
        "required": ["id", "title", "type", "priority", "steps", "expected_result"]
      }
    }
  },

## Maintenance Log & Operational Invariants

### Deployment Configuration
- **Server Port**: `3000` (configurable via `PORT` environment variable)
- **Local LLM Endpoint**: `http://127.0.0.1:11434` (configurable via `OLLAMA_HOST`)
- **Default Model**: `llama3.2`

### Webhook & Automation Triggers
- **Webhook Endpoint**: `POST /api/webhook/generate`
  - Accepts JSON payload: `{ "feature_description": "...", "test_type": "All|Functional|Negative|Security|UI/UX|Edge Cases", "webhook_url": "optional" }`
  - Triggers synchronous or asynchronous test suite generation and returns formatted JSON payload.

### Maintenance & Troubleshooting Guidelines
1. **Ollama Daemon Status**:
   - Check status: `curl http://127.0.0.1:11434/api/tags`
   - Restart daemon: `ollama serve`
2. **Model Availability**:
   - If `llama3.2` is missing: `ollama pull llama3.2`
3. **Application Server Logs**:
   - Application logs errors to stdout/stderr with timestamped log tags `[Ollama Request]`, `[Generation Error]`, `[Webhook Trigger]`.


