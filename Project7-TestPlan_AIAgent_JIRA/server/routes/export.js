/**
 * server/routes/export.js
 * Layer 2 — Export Downloads Route (Excel, CSV, Markdown, JSON)
 */

'use strict';

const router = require('express').Router();
const exportService = require('../../tools/export_service');

// POST /api/export/xlsx
router.post('/xlsx', async (req, res) => {
  try {
    const { testPlan, testCases, filename } = req.body;
    const buffer = await exportService.generateXlsxBuffer(testPlan, testCases);

    const safeName = (filename || `${testPlan?.ticketKey || 'TestSuite'}_TestCases`).replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/export/csv
router.post('/csv', (req, res) => {
  try {
    const { testCases, filename, ticketKey } = req.body;
    const csvContent = exportService.generateCsvString(testCases);

    const safeName = (filename || `${ticketKey || 'TestSuite'}_TestCases`).replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/export/markdown
router.post('/markdown', (req, res) => {
  try {
    const { testPlan, testCases, filename } = req.body;
    const mdContent = exportService.generateMarkdown(testPlan, testCases);

    const safeName = (filename || `${testPlan?.ticketKey || 'TestSuite'}_TestPlan`).replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.md"`);
    res.send(mdContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

