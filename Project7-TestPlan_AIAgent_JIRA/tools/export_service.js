/**
 * tools/export_service.js
 * Layer 3 — Export Engine (Excel XLSX, CSV, Markdown, JSON)
 *
 * Uses exceljs for rich, professional spreadsheet generation with multiple sheets.
 */

'use strict';

const ExcelJS = require('exceljs');

/**
 * Generates an Excel (.xlsx) Buffer containing both Test Plan and Test Cases sheets
 */
async function generateXlsxBuffer(testPlan = {}, testCases = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TestPlan AI Agent';
  workbook.created = new Date();

  // ── Sheet 1: Test Plan ───────────────────────────────────────────────────────
  const planSheet = workbook.addWorksheet('Test Plan', {
    views: [{ showGridLines: true }],
  });

  planSheet.columns = [
    { header: 'Property', key: 'property', width: 25 },
    { header: 'Details', key: 'details', width: 75 },
  ];

  // Header styling
  planSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  planSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Dark slate
  };

  planSheet.addRow({ property: 'Plan Title', details: testPlan.title || 'N/A' });
  planSheet.addRow({ property: 'JIRA Ticket', details: testPlan.ticketKey || 'N/A' });
  planSheet.addRow({ property: 'Generated At', details: testPlan.createdAt || new Date().toISOString() });
  planSheet.addRow({ property: 'Scope', details: testPlan.scope || 'N/A' });
  planSheet.addRow({ property: 'Objectives', details: (testPlan.objectives || []).join('\n• ') });
  planSheet.addRow({ property: 'Test Strategy', details: (testPlan.testStrategy?.types || []).join(', ') });
  planSheet.addRow({ property: 'Target Environments', details: (testPlan.testStrategy?.environments || []).join(', ') });
  planSheet.addRow({ property: 'Entry Criteria', details: (testPlan.testStrategy?.entryCriteria || []).join('\n• ') });
  planSheet.addRow({ property: 'Exit Criteria', details: (testPlan.testStrategy?.exitCriteria || []).join('\n• ') });
  planSheet.addRow({ property: 'Identified Risks', details: (testPlan.riskAssessment || []).join('\n• ') });
  if (testPlan.warning) {
    planSheet.addRow({ property: 'QA Warning', details: testPlan.warning });
  }

  // Wrap text on all rows
  planSheet.eachRow((row) => {
    row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    row.getCell(1).alignment = { vertical: 'top' };
  });

  // ── Sheet 2: Test Cases ─────────────────────────────────────────────────────
  const tcSheet = workbook.addWorksheet('Test Cases', {
    views: [{ showGridLines: true }],
  });

  tcSheet.columns = [
    { header: 'Test ID', key: 'id', width: 14 },
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Type', key: 'type', width: 16 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Preconditions', key: 'preconditions', width: 30 },
    { header: 'Step #', key: 'stepNumber', width: 10 },
    { header: 'Action', key: 'action', width: 40 },
    { header: 'Test Data', key: 'testData', width: 25 },
    { header: 'Expected Result', key: 'expectedResult', width: 40 },
    { header: 'Postconditions', key: 'postconditions', width: 25 },
  ];

  tcSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  tcSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }, // Royal Blue
  };

  testCases.forEach((tc) => {
    const steps = Array.isArray(tc.steps) && tc.steps.length > 0 ? tc.steps : [{ stepNumber: 1, action: 'Execute test', testData: 'N/A', expectedResult: 'Success' }];

    steps.forEach((step, sIdx) => {
      tcSheet.addRow({
        id: sIdx === 0 ? tc.id : '',
        title: sIdx === 0 ? tc.title : '',
        type: sIdx === 0 ? tc.type : '',
        priority: sIdx === 0 ? tc.priority : '',
        preconditions: sIdx === 0 ? tc.preconditions : '',
        stepNumber: step.stepNumber || sIdx + 1,
        action: step.action || '',
        testData: step.testData || '',
        expectedResult: step.expectedResult || '',
        postconditions: sIdx === 0 ? tc.postconditions : '',
      });
    });
  });

  tcSheet.eachRow((row) => {
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  return await workbook.xlsx.writeBuffer();
}

/**
 * Generates CSV string of test cases
 */
function generateCsvString(testCases = []) {
  const headers = ['Test ID', 'Title', 'Type', 'Priority', 'Preconditions', 'Step Number', 'Action', 'Test Data', 'Expected Result', 'Postconditions'];

  const rows = [headers.map((h) => `"${h}"`).join(',')];

  testCases.forEach((tc) => {
    const steps = Array.isArray(tc.steps) && tc.steps.length > 0 ? tc.steps : [{ stepNumber: 1, action: '', testData: '', expectedResult: '' }];

    steps.forEach((s) => {
      const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
      rows.push(
        [
          escape(tc.id),
          escape(tc.title),
          escape(tc.type),
          escape(tc.priority),
          escape(tc.preconditions),
          escape(s.stepNumber),
          escape(s.action),
          escape(s.testData),
          escape(s.expectedResult),
          escape(tc.postconditions),
        ].join(',')
      );
    });
  });

  return rows.join('\r\n');
}

/**
 * Generates formatted Markdown string of Test Plan & Cases
 */
function generateMarkdown(testPlan = {}, testCases = []) {
  let md = `# ${testPlan.title || 'Test Plan'}\n\n`;
  md += `**JIRA Ticket:** ${testPlan.ticketKey || 'N/A'}  \n`;
  md += `**Date:** ${testPlan.createdAt || new Date().toISOString()}  \n\n`;

  if (testPlan.warning) {
    md += `> ⚠️ **QA Notice:** ${testPlan.warning}\n\n`;
  }

  md += `## 1. Scope\n${testPlan.scope || 'N/A'}\n\n`;

  md += `## 2. Objectives\n`;
  (testPlan.objectives || []).forEach((obj) => {
    md += `- ${obj}\n`;
  });
  md += '\n';

  md += `## 3. Test Strategy\n`;
  md += `- **Test Types:** ${(testPlan.testStrategy?.types || []).join(', ')}\n`;
  md += `- **Environments:** ${(testPlan.testStrategy?.environments || []).join(', ')}\n`;
  md += `- **Entry Criteria:** ${(testPlan.testStrategy?.entryCriteria || []).join('; ')}\n`;
  md += `- **Exit Criteria:** ${(testPlan.testStrategy?.exitCriteria || []).join('; ')}\n\n`;

  md += `## 4. Test Cases\n\n`;
  md += `| ID | Title | Type | Priority | Steps Count |\n`;
  md += `|---|---|---|---|---|\n`;
  testCases.forEach((tc) => {
    md += `| ${tc.id} | ${tc.title} | ${tc.type} | ${tc.priority} | ${tc.steps?.length || 0} |\n`;
  });
  md += '\n---\n\n';

  testCases.forEach((tc) => {
    md += `### ${tc.id}: ${tc.title}\n`;
    md += `- **Type:** ${tc.type} | **Priority:** ${tc.priority}\n`;
    md += `- **Preconditions:** ${tc.preconditions || 'None'}\n\n`;
    md += `| Step | Action | Test Data | Expected Result |\n`;
    md += `|---|---|---|---|\n`;
    (tc.steps || []).forEach((s) => {
      md += `| ${s.stepNumber} | ${s.action} | ${s.testData || 'N/A'} | ${s.expectedResult} |\n`;
    });
    md += `\n**Postconditions:** ${tc.postconditions || 'None'}\n\n`;
  });

  return md;
}

module.exports = {
  generateXlsxBuffer,
  generateCsvString,
  generateMarkdown,
};

