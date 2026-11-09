/**
 * server/routes/gemini.js
 * Phase 2: GET /api/gemini/test-connection — Gemini ping only.
 * Full generation route is in /api/generate (Phase 3).
 */
'use strict';

const router = require('express').Router();
const gemini = require('../../tools/gemini_client');

// GET /api/gemini/test-connection
router.get('/test-connection', async (_req, res) => {
  try {
    const result = await gemini.testConnection();
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;

