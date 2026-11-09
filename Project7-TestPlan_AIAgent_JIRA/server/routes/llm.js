/**
 * server/routes/llm.js
 * Layer 2 — LLM Discovery and Health Routes
 */

'use strict';

const router = require('express').Router();
const anthropicClient = require('../../tools/anthropic_client');
const ollamaClient = require('../../tools/ollama_client');

// GET /api/llm/models — Returns available cloud and local models
router.get('/models', async (_req, res) => {
  try {
    // 1. Cloud models (Anthropic Claude default + Gemini)
    const cloudModels = [
      {
        provider: 'anthropic',
        name: 'Claude 3.7 Sonnet',
        id: 'claude-3-7-sonnet-20250219',
        tag: 'Recommended (Latest)',
        badge: 'Claude',
        requiresKey: true,
      },
      {
        provider: 'anthropic',
        name: 'Claude 3.5 Sonnet',
        id: 'claude-3-5-sonnet-20241022',
        tag: 'High Reasoning',
        badge: 'Claude',
        requiresKey: true,
      },
      {
        provider: 'anthropic',
        name: 'Claude 3 Opus',
        id: 'claude-3-opus-20240229',
        tag: 'Deep Analysis',
        badge: 'Claude',
        requiresKey: true,
      },
      {
        provider: 'anthropic',
        name: 'Claude 3.5 Haiku',
        id: 'claude-3-5-haiku-20241022',
        tag: 'Ultra Fast',
        badge: 'Claude',
        requiresKey: true,
      },
      {
        provider: 'gemini',
        name: 'Gemini 3.8 Flash',
        id: 'gemini-3.8-flash',
        tag: 'Balanced Cloud',
        badge: 'Gemini',
        requiresKey: true,
      },
    ];

    // 2. Discover local Ollama status
    const ollamaStatus = await ollamaClient.getOllamaStatus();

    const localModels = (ollamaStatus.models || []).map((m) => ({
      provider: 'ollama',
      name: `${m.name} (Local)`,
      id: m.name,
      tag: 'Local Offline',
      badge: 'Ollama',
      requiresKey: false,
    }));

    res.json({
      success: true,
      cloudModels,
      localModels,
      ollamaStatus,
      defaultModel: {
        provider: 'anthropic',
        id: 'claude-3-5-sonnet-20241022',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/llm/test-anthropic — Test Anthropic API Key
router.post('/test-anthropic', async (req, res) => {
  try {
    const result = await anthropicClient.testConnection(req.body.apiKey);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;

