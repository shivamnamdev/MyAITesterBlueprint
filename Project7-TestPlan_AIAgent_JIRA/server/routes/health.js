/**
 * server/routes/health.js
 * GET /api/health — simple liveness check
 */
'use strict';

const router = require('express').Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TestPlan AI Agent',
    version: '1.0.0',
    phase: 'Phase 2 — Link (Connectivity)',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

