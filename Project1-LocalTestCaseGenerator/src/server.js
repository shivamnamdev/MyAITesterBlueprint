import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMasterPrompt } from './prompts/master_prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to sanitize & parse JSON from LLM outputs
function repairAndParseJSON(rawResponse) {
  if (typeof rawResponse === 'object' && rawResponse !== null) {
    return rawResponse;
  }

  let text = String(rawResponse || '').trim();

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Find first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    text = text.substring(start, end + 1);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse raw JSON output:', err, 'Raw text:', text);
    throw new Error(`Failed to parse LLM JSON output: ${err.message}`);
  }
}

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) {
      return res.status(503).json({ status: 'error', message: 'Ollama service is unreachable' });
    }
    const data = await response.json();
    const models = data.models || [];
    const hasLlama32 = models.some(m => m.name.includes('llama3.2'));
    return res.json({
      status: 'ok',
      ollama: 'connected',
      models: models.map(m => m.name),
      llama32Available: hasLlama32
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: `Ollama connection failed: ${error.message}`
    });
  }
});

// Test Case Generation Endpoint
app.post('/api/generate', async (req, res) => {
  const { feature_description, test_type = 'All', model = 'llama3.2' } = req.body;

  if (!feature_description || !feature_description.trim()) {
    return res.status(400).json({ error: 'feature_description is required' });
  }

  const prompt = buildMasterPrompt(feature_description, test_type);

  try {
    console.log(`[Ollama Request] Sending prompt for test_type="${test_type}" model="${model}"`);

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.2, // Low temperature for deterministic output
          top_p: 0.9
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Ollama API Error]', response.status, errText);
      return res.status(response.status).json({
        error: `Ollama API Error (${response.status}): ${errText}`
      });
    }

    const result = await response.json();
    const rawOutput = result.response;

    console.log('[Ollama Response Received] Parsing payload...');
    const parsedData = repairAndParseJSON(rawOutput);

    // Validate minimum payload structure
    if (!parsedData.test_cases || !Array.isArray(parsedData.test_cases)) {
      throw new Error('LLM response missing required "test_cases" array');
    }

    return res.json({
      success: true,
      model: model,
      data: parsedData
    });

  } catch (error) {
    console.error('[Generation Error]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while generating test cases'
    });
  }
});

// Automation Webhook Trigger Endpoint (Phase 5: Trigger)
app.post('/api/webhook/generate', async (req, res) => {
  const { feature_description, test_type = 'All', webhook_url } = req.body;

  if (!feature_description) {
    return res.status(400).json({ error: 'feature_description parameter is required' });
  }

  console.log(`[Webhook Trigger Received] Feature: "${feature_description.substring(0, 40)}..."`);

  try {
    const prompt = buildMasterPrompt(feature_description, test_type);
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP Error ${response.status}`);
    }

    const result = await response.json();
    const parsedData = repairAndParseJSON(result.response);

    // Optional callback notification if webhook_url provided
    if (webhook_url) {
      fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'testcases.generated', payload: parsedData })
      }).catch(err => console.error('[Webhook Callback Error]', err.message));
    }

    return res.json({
      event: 'testcases.generated',
      timestamp: new Date().toISOString(),
      payload: parsedData
    });

  } catch (err) {
    console.error('[Webhook Trigger Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local LLM Testcase Generator running on http://localhost:${PORT}`);
});

