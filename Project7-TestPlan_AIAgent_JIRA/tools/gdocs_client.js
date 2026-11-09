/**
 * tools/gdocs_client.js
 * Layer 3 — Google Docs API v1 & Drive API Client
 *
 * Handles OAuth2 authentication and structured Test Plan document generation.
 */

'use strict';

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TOKENS_PATH = path.join(__dirname, '..', '.tmp', 'google_tokens.json');

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
];

/**
 * Creates OAuth2 client
 */
function getOAuth2Client() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI || 'http://localhost:5080/api/gdocs/callback'
  );
}

/**
 * Checks if credentials are configured and if valid tokens exist
 */
function checkCredentials() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

  const isConfigured =
    !!GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
    !!GOOGLE_CLIENT_SECRET &&
    GOOGLE_CLIENT_SECRET !== 'your_google_client_secret';

  let hasStoredTokens = false;
  if (fs.existsSync(TOKENS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
      hasStoredTokens = !!data.access_token;
    } catch {}
  }

  return {
    configured: isConfigured,
    authenticated: hasStoredTokens,
    clientId: isConfigured ? `${GOOGLE_CLIENT_ID.substring(0, 12)}...` : null,
    redirectUri: GOOGLE_REDIRECT_URI || 'http://localhost:5080/api/gdocs/callback',
    message: isConfigured
      ? hasStoredTokens
        ? 'Google Docs is authenticated and ready to export documents.'
        : 'Google Docs credentials present. Authorization required.'
      : 'Google Docs is optional. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable.',
  };
}

/**
 * Generates OAuth consent URL
 */
function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Exchanges authorization code for tokens and saves to .tmp
 */
async function exchangeCode(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const tmpDir = path.dirname(TOKENS_PATH);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));

  return { success: true, message: 'Google Docs authenticated successfully' };
}

/**
 * Gets authenticated Google Docs API instance
 */
function getDocsService() {
  const oauth2Client = getOAuth2Client();
  if (fs.existsSync(TOKENS_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
    oauth2Client.setCredentials(tokens);
  } else {
    throw new Error('Google Docs not authenticated. Please complete OAuth authorization.');
  }

  return google.docs({ version: 'v1', auth: oauth2Client });
}

/**
 * Exports Test Plan and Test Cases to a formatted Google Doc
 */
async function exportToGoogleDoc(testPlan = {}, testCases = []) {
  const docs = getDocsService();
  const title = `[Test Plan] ${testPlan.ticketKey || 'QA'}: ${testPlan.title || 'Generated Test Suite'}`;

  // 1. Create empty document
  const createRes = await docs.documents.create({
    requestBody: { title },
  });

  const documentId = createRes.data.documentId;

  // 2. Build formatted body text
  let content = `${title}\n`;
  content += `JIRA Ticket: ${testPlan.ticketKey || 'N/A'}\n`;
  content += `Generated Date: ${testPlan.createdAt || new Date().toISOString()}\n\n`;

  if (testPlan.warning) {
    content += `⚠️ WARNING: ${testPlan.warning}\n\n`;
  }

  content += `1. SCOPE & OBJECTIVES\n`;
  content += `Scope: ${testPlan.scope || 'N/A'}\n\n`;
  content += `Objectives:\n`;
  (testPlan.objectives || []).forEach((obj) => {
    content += `• ${obj}\n`;
  });
  content += '\n';

  content += `2. TEST STRATEGY\n`;
  content += `Test Types: ${(testPlan.testStrategy?.types || []).join(', ')}\n`;
  content += `Environments: ${(testPlan.testStrategy?.environments || []).join(', ')}\n`;
  content += `Entry Criteria: ${(testPlan.testStrategy?.entryCriteria || []).join('; ')}\n`;
  content += `Exit Criteria: ${(testPlan.testStrategy?.exitCriteria || []).join('; ')}\n\n`;

  content += `3. TEST CASES (${testCases.length} Total)\n\n`;
  testCases.forEach((tc) => {
    content += `------------------------------------------------------------\n`;
    content += `[${tc.id}] ${tc.title}\n`;
    content += `Type: ${tc.type} | Priority: ${tc.priority}\n`;
    content += `Preconditions: ${tc.preconditions || 'None'}\n\n`;
    content += `Test Steps:\n`;
    (tc.steps || []).forEach((s) => {
      content += `  Step ${s.stepNumber}: ${s.action}\n`;
      content += `    Test Data: ${s.testData || 'N/A'}\n`;
      content += `    Expected:  ${s.expectedResult}\n`;
    });
    content += `Postconditions: ${tc.postconditions || 'None'}\n\n`;
  });

  // 3. Batch insert content into the document
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content,
          },
        },
      ],
    },
  });

  const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  return {
    success: true,
    documentId,
    url: docUrl,
    title,
  };
}

module.exports = {
  checkCredentials,
  getAuthUrl,
  exchangeCode,
  exportToGoogleDoc,
};
