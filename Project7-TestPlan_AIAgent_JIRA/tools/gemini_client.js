/**
 * tools/gemini_client.js
 * Layer 3 — Gemini API Wrapper (@google/genai SDK >= 2.29.1)
 *
 * Rules:
 *  - Model: gemini-3.8-flash (NEVER deprecated gemini-2.x or 1.5.x)
 *  - Temperature: 0.2 (locked — never raise above 0.3)
 *  - responseMimeType: "application/json" for all generation calls
 */

'use strict';

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

function getClient(userApiKey) {
  const key = (userApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!key) {
    throw new Error('Gemini API Key is required. Please set GEMINI_API_KEY in .env or pass it via UI');
  }
  return new GoogleGenAI({ apiKey: key });
}

// ── Handshake: verify API key with a minimal prompt ──────────────────────────
async function testConnection(userApiKey) {
  const client = getClient(userApiKey);

  const response = await client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: 'Reply with exactly: {"status":"ok"}',
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const raw = response.text.trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Gemini ping returned non-JSON: ${raw}`);
  }

  return {
    success: true,
    model: 'gemini-3.8-flash',
    temperature: 0.2,
    response: parsed,
  };
}

module.exports = {
  getClient,
  testConnection,
};
