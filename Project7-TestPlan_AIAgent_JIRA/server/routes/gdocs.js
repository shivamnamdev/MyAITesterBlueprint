/**
 * server/routes/gdocs.js
 * Layer 2 — Google Docs Navigation Routes
 */

'use strict';

const router = require('express').Router();
const gdocsClient = require('../../tools/gdocs_client');

// GET /api/gdocs/status
router.get('/status', (_req, res) => {
  try {
    const result = gdocsClient.checkCredentials();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/gdocs/auth-url
router.get('/auth-url', (_req, res) => {
  try {
    const url = gdocsClient.getAuthUrl();
    res.json({ success: true, url });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/gdocs/callback (OAuth redirect)
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Authorization code missing.');
    }
    await gdocsClient.exchangeCode(code);
    res.send(`
      <html>
        <body style="font-family: sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center; background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155;">
            <h2 style="color: #34d399;">✅ Google Docs Authenticated!</h2>
            <p>You can close this tab and return to the TestPlan AI Agent.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`OAuth error: ${err.message}`);
  }
});

// POST /api/gdocs/export
router.post('/export', async (req, res) => {
  try {
    const { testPlan, testCases } = req.body;
    const result = await gdocsClient.exportToGoogleDoc(testPlan, testCases);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
