/**
 * server/index.js
 * Layer 2 — Express Server Entry Point
 */

'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const healthRouter = require('./routes/health');
const jiraRouter = require('./routes/jira');
const geminiRouter = require('./routes/gemini');
const gdocsRouter = require('./routes/gdocs');
const generateRouter = require('./routes/generate');
const llmRouter = require('./routes/llm');
const exportRouter = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5080;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/jira', jiraRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/gdocs', gdocsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/llm', llmRouter);
app.use('/api/export', exportRouter);

// ── Serve React Static Build (if dist/ exists) ────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TestPlan AI Agent server running at http://localhost:${PORT}`);
  console.log(`   Health:         GET  http://localhost:${PORT}/api/health`);
  console.log(`   JIRA routes:    POST http://localhost:${PORT}/api/jira/test-connection`);
  console.log(`                   POST http://localhost:${PORT}/api/jira/fetch-ticket`);
  console.log(`   LLM models:     GET  http://localhost:${PORT}/api/llm/models`);
  console.log(`   Generation:     POST http://localhost:${PORT}/api/generate`);
  console.log(`   Exports:        POST http://localhost:${PORT}/api/export/xlsx | csv | markdown\n`);
});
