/**
 * server/routes/generate.js
 * Layer 2 — Test Plan & Test Case Generation Routes
 *
 * Implements two-stage human-in-the-loop workflow:
 *  - POST /api/generate/plan: Stage 1 (Generate Test Plan only)
 *  - POST /api/generate/cases: Stage 2 (Generate Test Cases only after plan approval)
 *  - POST /api/generate/parse-doc: Parse uploaded file (PDF, TXT, MD, JSON)
 */

'use strict';

const router = require('express').Router();
const llmRouter = require('../../tools/llm_router');
const docParser = require('../../tools/document_parser');

// POST /api/generate/parse-doc — Parse uploaded requirement file
router.post('/parse-doc', async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ success: false, error: 'File data is required' });
    }
    const result = await docParser.parseUploadedDocument(file);
    res.json({ success: true, doc: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/generate/plan — STAGE 1: Generate Test Plan ONLY
router.post('/plan', async (req, res) => {
  try {
    const { provider, model, apiKey, ticket, supplementalDoc } = req.body;

    if (!ticket) {
      return res.status(400).json({ success: false, error: 'JIRA ticket details are required.' });
    }

    const result = await llmRouter.generateTestPlan({
      provider: provider || 'anthropic',
      model: model || 'claude-3-5-sonnet-20241022',
      apiKey: apiKey || '',
      ticket,
      supplementalDoc,
    });

    res.json(result);
  } catch (err) {
    console.error('Test Plan generation error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/generate/cases — STAGE 2: Generate Test Cases (Requires approved plan)
router.post('/cases', async (req, res) => {
  try {
    const { provider, model, apiKey, ticket, approvedTestPlan, supplementalDoc } = req.body;

    if (!ticket) {
      return res.status(400).json({ success: false, error: 'JIRA ticket details are required.' });
    }
    if (!approvedTestPlan) {
      return res.status(400).json({ success: false, error: 'Approved Test Plan is required to generate test cases.' });
    }

    const result = await llmRouter.generateTestCases({
      provider: provider || 'anthropic',
      model: model || 'claude-3-5-sonnet-20241022',
      apiKey: apiKey || '',
      ticket,
      approvedTestPlan,
      supplementalDoc,
    });

    res.json(result);
  } catch (err) {
    console.error('Test Cases generation error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/generate — Legacy combined endpoint
router.post('/', async (req, res) => {
  try {
    const { provider, model, apiKey, ticket, supplementalDoc } = req.body;

    if (!ticket) {
      return res.status(400).json({ success: false, error: 'JIRA ticket details are required.' });
    }

    const result = await llmRouter.generateTestSuite({
      provider: provider || 'anthropic',
      model: model || 'claude-3-5-sonnet-20241022',
      apiKey: apiKey || '',
      ticket,
      supplementalDoc,
    });

    res.json(result);
  } catch (err) {
    console.error('Generation error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
