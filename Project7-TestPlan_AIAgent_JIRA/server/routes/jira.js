/**
 * server/routes/jira.js
 * Layer 2 — JIRA Routes
 */

'use strict';

const router = require('express').Router();
const jiraClient = require('../../tools/jira_client');

// POST /api/jira/test-connection (accepts credentials from UI or falls back to env)
router.post('/test-connection', async (req, res) => {
  try {
    const result = await jiraClient.testConnection(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/jira/test-connection (legacy convenience for env-only test)
router.get('/test-connection', async (req, res) => {
  try {
    const result = await jiraClient.testConnection({});
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/jira/fetch-ticket
router.post('/fetch-ticket', async (req, res) => {
  try {
    const result = await jiraClient.fetchTicket(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/jira/create-test-issue
router.post('/create-test-issue', async (req, res) => {
  try {
    const result = await jiraClient.createTestIssue(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
