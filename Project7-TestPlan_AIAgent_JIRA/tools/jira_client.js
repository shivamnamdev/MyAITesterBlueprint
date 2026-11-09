/**
 * tools/jira_client.js
 * Layer 3 — JIRA REST API Client (v3 with v2 fallback & PAT support)
 *
 * Supports credentials passed dynamically via UI request body OR from .env.
 * Handles URL sanitization, ticket key extraction, ADF parsing, and AC extraction.
 */

'use strict';

const axios = require('axios');
require('dotenv').config();

/**
 * Builds HTTP headers (Basic Auth for Cloud or Bearer for PAT)
 */
function getHeaders(email, apiToken) {
  const cleanEmail = (email || process.env.JIRA_EMAIL || '').trim();
  const cleanToken = (apiToken || process.env.JIRA_API_TOKEN || '').trim().replace(/^Bearer\s+/i, '');

  if (!cleanToken) {
    throw new Error('JIRA API Token is required.');
  }

  let authHeader = '';
  if (cleanEmail) {
    // Standard Atlassian Cloud Basic Auth: base64(email:token)
    const encoded = Buffer.from(`${cleanEmail}:${cleanToken}`).toString('base64');
    authHeader = `Basic ${encoded}`;
  } else {
    // Personal Access Token (Jira Server/Data Center)
    authHeader = `Bearer ${cleanToken}`;
  }

  return {
    Authorization: authHeader,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Atlassian-Token': 'no-check',
    'User-Agent': 'TestPlan-AI-Agent/1.0',
  };
}

/**
 * Normalizes JIRA base URL (strips paths like /browse/..., /jira/software/..., trailing slashes)
 */
function cleanBaseUrl(url) {
  let target = (url || process.env.JIRA_BASE_URL || '').trim();
  if (!target) {
    throw new Error('JIRA Base URL is required (e.g., https://your-org.atlassian.net)');
  }

  if (!/^https?:\/\//i.test(target)) {
    target = `https://${target}`;
  }

  try {
    const parsed = new URL(target);
    // If Atlassian Cloud domain (*.atlassian.net), origin is always the root
    if (parsed.hostname.endsWith('.atlassian.net')) {
      return parsed.origin;
    }
    // For custom domains, strip /browse/..., /jira/software/..., /secure/...
    let cleanPath = parsed.pathname
      .replace(/\/browse\/.*$/i, '')
      .replace(/\/jira\/software\/.*$/i, '')
      .replace(/\/secure\/.*$/i, '')
      .replace(/\/+$/, '');
    return `${parsed.origin}${cleanPath}`;
  } catch {
    return target.replace(/\/+$/, '');
  }
}

/**
 * Extracts clean ticket key (e.g. "PROJ-101") even if user pasted full URL or just a number
 */
function extractTicketKey(rawInput, projectKey) {
  if (!rawInput) return '';
  const str = String(rawInput).trim();

  // If user pasted a full URL (e.g. https://org.atlassian.net/browse/PROJ-123 or selectedIssue=PROJ-123)
  const urlMatch = str.match(/(?:browse|issues|selectedIssue=|\/)([A-Za-z][A-Za-z0-9_]*-[0-9]+)/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }

  // If standard KEY-NUMBER (e.g. PROJ-101, SCRUM-42)
  const keyMatch = str.match(/([A-Za-z][A-Za-z0-9_]*-[0-9]+)/i);
  if (keyMatch) {
    return keyMatch[1].toUpperCase();
  }

  // If user only entered digits (e.g. "12") and projectKey is provided (e.g. "PROJ")
  const numOnly = str.match(/^([0-9]+)$/);
  if (numOnly && projectKey) {
    return `${projectKey.trim().toUpperCase()}-${numOnly[1]}`;
  }

  return str.toUpperCase();
}

/**
 * Recursively converts Atlassian Document Format (ADF) JSON to clean readable text
 */
function adfToPlainText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;

  let text = '';

  if (node.type === 'text') {
    text += node.text || '';
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const childText = adfToPlainText(child);
      if (child.type === 'paragraph') {
        text += childText + '\n\n';
      } else if (child.type === 'bulletList' || child.type === 'orderedList') {
        text += childText + '\n';
      } else if (child.type === 'listItem') {
        text += `• ${childText.trim()}\n`;
      } else if (child.type === 'heading') {
        const level = node.attrs?.level || 2;
        text += `${'#'.repeat(level)} ${childText}\n\n`;
      } else if (child.type === 'codeBlock') {
        text += `\`\`\`\n${childText}\n\`\`\`\n\n`;
      } else {
        text += childText;
      }
    }
  }

  return text.trim();
}

/**
 * Extracts Acceptance Criteria from JIRA description or common custom fields
 */
function extractAcceptanceCriteria(fields, descriptionText) {
  // 1. Check custom fields
  for (const [key, val] of Object.entries(fields)) {
    if (key.startsWith('customfield_') && val) {
      if (typeof val === 'string' && val.length > 5) {
        const lowerVal = val.toLowerCase();
        if (
          lowerVal.includes('given') ||
          lowerVal.includes('when') ||
          lowerVal.includes('then') ||
          lowerVal.includes('scenario') ||
          lowerVal.includes('criteria')
        ) {
          return val;
        }
      } else if (typeof val === 'object' && val.type === 'doc') {
        const parsed = adfToPlainText(val);
        if (parsed.length > 10) return parsed;
      }
    }
  }

  // 2. Parse from description text if standard section exists
  if (descriptionText) {
    const regex = /(?:acceptance\s*criteria|ac|acceptance\s*tests)[:\s]*([\s\S]*?)(?:(?:\n\n[A-Z][a-zA-Z\s]+:)|$)/i;
    const match = descriptionText.match(regex);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Handshake: tests connection with provided or env credentials
 */
async function testConnection(credentials = {}) {
  const baseUrl = cleanBaseUrl(credentials.baseUrl);
  const email = (credentials.email || process.env.JIRA_EMAIL || '').trim();
  const apiToken = (credentials.apiToken || process.env.JIRA_API_TOKEN || '').trim();
  const projectKey = (credentials.projectKey || process.env.JIRA_PROJECT_KEY || '').trim();

  if (!apiToken) {
    throw new Error('JIRA API Token is required');
  }

  const headers = getHeaders(email, apiToken);

  let meRes;
  try {
    // Try REST API v3
    meRes = await axios.get(`${baseUrl}/rest/api/3/myself`, { headers, timeout: 10000 });
  } catch (err3) {
    // Fallback to REST API v2 (for Jira Server / Data Center)
    if (err3.response?.status === 401 || err3.response?.status === 404) {
      try {
        meRes = await axios.get(`${baseUrl}/rest/api/2/myself`, { headers, timeout: 10000 });
      } catch (err2) {
        if (err3.response?.status === 401 || err2.response?.status === 401) {
          throw new Error(
            `401 Unauthorized: JIRA rejected credentials for "${email || 'token'}" at ${baseUrl}.\n\n` +
            `Quick Check:\n` +
            `1. In Jira Cloud (*.atlassian.net), you MUST use an API Token (NOT your login password).\n` +
            `   Create a token here: https://id.atlassian.com/manage-profile/security/api-tokens\n` +
            `2. Ensure the email "${email}" matches the exact Atlassian account where the token was created.\n` +
            `3. Make sure there are no extra spaces or quotes in your token.`
          );
        }
        const errDetail =
          err3.response?.data?.errorMessages?.join(', ') ||
          err2.response?.data?.errorMessages?.join(', ') ||
          err3.message;
        throw new Error(`JIRA connection failed: ${errDetail}`);
      }
    } else {
      const errDetail = err3.response?.data?.errorMessages?.join(', ') || err3.message;
      throw new Error(`JIRA connection failed: ${errDetail}`);
    }
  }

  const userData = {
    displayName: meRes.data.displayName || meRes.data.name || 'JIRA User',
    emailAddress: meRes.data.emailAddress || email || '',
    accountId: meRes.data.accountId || meRes.data.key,
    active: meRes.data.active,
  };

  // Optional: check project if provided
  let projectData = null;
  if (projectKey) {
    try {
      const projRes = await axios.get(
        `${baseUrl}/rest/api/3/project/${encodeURIComponent(projectKey)}`,
        { headers, timeout: 10000 }
      );
      projectData = {
        key: projRes.data.key,
        name: projRes.data.name,
        projectTypeKey: projRes.data.projectTypeKey,
      };
    } catch (projErr) {
      console.warn(`Project ${projectKey} lookup notice:`, projErr.message);
    }
  }

  return {
    success: true,
    message: `Connected successfully as ${userData.displayName}`,
    user: userData,
    project: projectData,
    baseUrl,
  };
}

/**
 * Fetches ticket details (Story, Bug, Epic) by Ticket ID / Key with v3 & v2 fallback
 */
async function fetchTicket(params = {}) {
  const baseUrl = cleanBaseUrl(params.baseUrl);
  const email = (params.email || process.env.JIRA_EMAIL || '').trim();
  const apiToken = (params.apiToken || process.env.JIRA_API_TOKEN || '').trim();
  const rawTicket = params.ticketId || params.ticketKey || '';
  const projectKey = (params.projectKey || process.env.JIRA_PROJECT_KEY || '').trim();

  const ticketKey = extractTicketKey(rawTicket, projectKey);

  if (!ticketKey) {
    throw new Error('Ticket ID (e.g. PROJ-101) is required');
  }

  const headers = getHeaders(email, apiToken);

  let res;
  try {
    // Try REST API v3
    const urlV3 = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(ticketKey)}`;
    res = await axios.get(urlV3, { headers, timeout: 15000 });
  } catch (err3) {
    // Fall back to REST API v2 if 404 or 400
    if (err3.response?.status === 404 || err3.response?.status === 400) {
      try {
        const urlV2 = `${baseUrl}/rest/api/2/issue/${encodeURIComponent(ticketKey)}`;
        res = await axios.get(urlV2, { headers, timeout: 15000 });
      } catch (err2) {
        const jiraErrors = [
          ...(err3.response?.data?.errorMessages || []),
          ...(err2.response?.data?.errorMessages || []),
          ...Object.values(err3.response?.data?.errors || {}),
          ...Object.values(err2.response?.data?.errors || {}),
        ];

        const details = jiraErrors.filter(Boolean).join('; ');
        let message = details || err3.response?.data?.message || err3.message;

        if (err3.response?.status === 404) {
          message = `JIRA Issue "${ticketKey}" not found at ${baseUrl}. ${
            details ? `(${details})` : 'Please ensure the ticket key is correct and your user account has permission to browse this project/issue.'
          }`;
        }
        throw new Error(message);
      }
    } else {
      const jiraMsg =
        err3.response?.data?.errorMessages?.join('; ') ||
        err3.response?.data?.message ||
        err3.message;
      throw new Error(`JIRA API error: ${jiraMsg}`);
    }
  }

  const issue = res.data;
  const fields = issue.fields || {};

  // Parse description
  let rawDescription = '';
  if (typeof fields.description === 'object' && fields.description !== null) {
    rawDescription = adfToPlainText(fields.description);
  } else if (typeof fields.description === 'string') {
    rawDescription = fields.description;
  }

  // Extract Acceptance Criteria
  const acceptanceCriteria = extractAcceptanceCriteria(fields, rawDescription);

  return {
    success: true,
    ticket: {
      key: issue.key,
      id: issue.id,
      summary: fields.summary || '',
      issueType: fields.issuetype?.name || 'Story',
      issueTypeIcon: fields.issuetype?.iconUrl,
      status: fields.status?.name || 'Unknown',
      priority: fields.priority?.name || 'Medium',
      description: rawDescription || '(No description provided in JIRA ticket)',
      acceptanceCriteria: acceptanceCriteria || '',
      hasAcceptanceCriteria: !!acceptanceCriteria,
      assignee: fields.assignee ? fields.assignee.displayName : 'Unassigned',
      reporter: fields.reporter ? fields.reporter.displayName : 'Unknown',
      labels: Array.isArray(fields.labels) ? fields.labels : [],
      project: {
        key: fields.project?.key,
        name: fields.project?.name,
      },
      epic: fields.parent ? { key: fields.parent.key, summary: fields.parent.fields?.summary } : null,
      browseUrl: `${baseUrl}/browse/${issue.key}`,
    },
  };
}

/**
 * Creates a linked Test Issue back in JIRA (Optional)
 */
async function createTestIssue(params = {}) {
  const baseUrl = cleanBaseUrl(params.baseUrl);
  const email = (params.email || process.env.JIRA_EMAIL || '').trim();
  const apiToken = (params.apiToken || process.env.JIRA_API_TOKEN || '').trim();
  const { projectKey, testCase, linkedTicketKey } = params;

  if (!projectKey) throw new Error('projectKey is required to create a JIRA issue');
  if (!testCase) throw new Error('testCase data is required');

  const headers = getHeaders(email, apiToken);

  const stepsText = (testCase.steps || [])
    .map(
      (s, idx) =>
        `Step ${idx + 1}: ${s.action}\n  Data: ${s.testData || 'N/A'}\n  Expected: ${s.expectedResult}`
    )
    .join('\n\n');

  const fullDesc = `Pre-conditions:\n${testCase.preconditions || 'None'}\n\nTest Steps:\n${stepsText}\n\nGenerated automatically by TestPlan AI Agent.`;

  const payload = {
    fields: {
      project: { key: projectKey },
      summary: `[Test] ${testCase.title}`,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: fullDesc }],
          },
        ],
      },
      issuetype: { name: 'Task' },
    },
  };

  const createRes = await axios.post(`${baseUrl}/rest/api/3/issue`, payload, {
    headers,
    timeout: 15000,
  });
  const createdKey = createRes.data.key;

  if (linkedTicketKey) {
    try {
      await axios.post(
        `${baseUrl}/rest/api/3/issueLink`,
        {
          type: { name: 'Relates' },
          inwardIssue: { key: createdKey },
          outwardIssue: { key: linkedTicketKey },
        },
        { headers, timeout: 10000 }
      );
    } catch (linkErr) {
      console.warn(`Could not link ${createdKey} to ${linkedTicketKey}:`, linkErr.message);
    }
  }

  return {
    success: true,
    issueKey: createdKey,
    url: `${baseUrl}/browse/${createdKey}`,
  };
}

module.exports = {
  testConnection,
  fetchTicket,
  createTestIssue,
  adfToPlainText,
  cleanBaseUrl,
  extractTicketKey,
};
