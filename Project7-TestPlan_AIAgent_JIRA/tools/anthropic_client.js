/**
 * tools/anthropic_client.js
 * Layer 3 — Anthropic Claude API Client (@anthropic-ai/sdk)
 *
 * Models supported:
 *  - claude-3-7-sonnet-20250219 (Claude 3.7 Sonnet)
 *  - claude-3-5-sonnet-20241022 (Claude 3.5 Sonnet)
 *  - claude-3-opus-20240229 (Claude 3 Opus)
 *  - claude-3-5-haiku-20241022 (Claude 3.5 Haiku)
 *
 * Rules:
 *  - Temperature: 0.2 (strict, deterministic)
 *  - Structured JSON response
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

function getClient(userApiKey) {
  const apiKey = (userApiKey || process.env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Anthropic API Key is required. Please paste your Anthropic API Key in the UI or set ANTHROPIC_API_KEY in .env');
  }
  return new Anthropic({ apiKey });
}

/**
 * Tests connection with Anthropic API
 */
async function testConnection(userApiKey) {
  const client = getClient(userApiKey);
  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 30,
    temperature: 0.2,
    messages: [{ role: 'user', content: 'Reply with JSON: {"status":"ok"}' }],
  });

  const reply = response.content[0]?.text || '';
  return {
    success: true,
    modelUsed: 'claude-3-5-haiku-20241022',
    reply: reply.trim(),
  };
}

/**
 * Generates Test Suite using Claude
 */
async function generateWithClaude(params = {}) {
  const { model = 'claude-3-5-sonnet-20241022', prompt, system, apiKey } = params;
  const client = getClient(apiKey);

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature: 0.2,
    system: system || 'You are an elite QA Principal Engineer. Always return pure valid JSON without markdown fences.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const rawText = response.content[0]?.text || '';
  return rawText;
}

module.exports = {
  testConnection,
  generateWithClaude,
};

