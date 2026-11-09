/**
 * tools/ollama_client.js
 * Layer 3 — Local Ollama Client (http://localhost:11434)
 *
 * Automatically discovers installed models (llama3.2, codellama, mistral, etc.)
 * Generates structured JSON at temperature 0.2
 */

'use strict';

const axios = require('axios');
require('dotenv').config();

const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'http://localhost:11434').replace(/\/+$/, '');

/**
 * Checks if local Ollama is active and returns installed models
 */
async function getOllamaStatus() {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 3000 });
    const models = (res.data?.models || []).map((m) => ({
      name: m.name,
      size: m.size,
      modifiedAt: m.modified_at,
    }));

    return {
      available: true,
      host: OLLAMA_HOST,
      models,
      defaultModel: models.find((m) => m.name.includes('llama3.2'))?.name || models[0]?.name || 'llama3.2',
    };
  } catch (err) {
    return {
      available: false,
      host: OLLAMA_HOST,
      models: [],
      error: 'Ollama is not running locally. Start it with `ollama serve` if you wish to use local models.',
    };
  }
}

/**
 * Generates response using local Ollama model
 */
async function generateWithOllama(params = {}) {
  const { model = 'llama3.2', prompt, system } = params;

  const payload = {
    model,
    prompt,
    system: system || 'You are an elite QA Principal Engineer. Always return pure valid JSON without markdown fences.',
    format: 'json',
    stream: false,
    options: {
      temperature: 0.2,
      top_p: 0.9,
    },
  };

  const res = await axios.post(`${OLLAMA_HOST}/api/generate`, payload, {
    timeout: 120000, // 2 minutes for local inference
  });

  return res.data?.response || '';
}

module.exports = {
  getOllamaStatus,
  generateWithOllama,
};

