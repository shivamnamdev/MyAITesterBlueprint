/**
 * tools/llm_router.js
 * Layer 3 — Unified Multi-LLM Router
 *
 * Implements two-stage generation:
 *  - Stage 1: generateTestPlan (Test Plan ONLY for human review & approval)
 *  - Stage 2: generateTestCases (Test Cases generated only AFTER Test Plan approval)
 *
 * Supports supplemental uploaded documentation (PRD, Technical Spec, API Schema).
 * Enforces temperature 0.2 and Single Source of Truth.
 */

'use strict';

const anthropicClient = require('./anthropic_client');
const ollamaClient = require('./ollama_client');
const geminiClient = require('./gemini_client');
const { v4: uuidv4 } = require('uuid');

/**
 * Strips markdown code blocks and cleans JSON string
 */
function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
  }
  return cleaned.trim();
}

/**
 * Builds the strict, deterministic QA System Instruction
 */
function buildSystemInstruction() {
  return `You are a Principal QA Automation and Quality Architect with 15+ years of software testing experience.
Your mission is to generate an exhaustive, deterministic, high-coverage Test Plan or step-by-step Test Cases based STRICTLY on the provided requirement details.

CRITICAL RULES:
1. SINGLE SOURCE OF TRUTH: Rely ONLY on the provided Ticket Details, Description, Acceptance Criteria, and Uploaded Supplemental Documents. Do NOT invent fictional business flows or unrelated third-party integrations.
2. MISSING ACCEPTANCE CRITERIA: If Acceptance Criteria is absent or empty, explicitly populate the "warning" field in the Test Plan alerting the team.
3. DETERMINISTIC JSON: You MUST return a single, valid JSON object strictly adhering to the specified schema without any markdown, introductory text, or trailing commentary.`;
}

/**
 * Core LLM caller handling provider switching
 */
async function callLlm(params) {
  const { provider = 'anthropic', model, apiKey = '', prompt, system } = params;

  if (provider === 'anthropic') {
    return await anthropicClient.generateWithClaude({
      model: model || 'claude-3-5-sonnet-20241022',
      prompt,
      system,
      apiKey,
    });
  } else if (provider === 'ollama') {
    return await ollamaClient.generateWithOllama({
      model: model || 'llama3.2',
      prompt,
      system,
    });
  } else if (provider === 'gemini') {
    const client = geminiClient.getClient(apiKey);
    const resp = await client.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: `${system}\n\n${prompt}`,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });
    return resp.text;
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

/**
 * Formats supplemental uploaded document section
 */
function formatSupplementalDoc(doc) {
  if (!doc || !doc.text) return '';
  return `\nSUPPLEMENTAL UPLOADED SPECIFICATION / DOCUMENT (${doc.filename || 'Requirement Document'}):\n"""\n${doc.text}\n"""\n`;
}

/**
 * STAGE 1: Generates Test Plan ONLY for human review & approval
 */
async function generateTestPlan(params = {}) {
  const {
    provider = 'anthropic',
    model = 'claude-3-5-sonnet-20241022',
    apiKey = '',
    ticket,
    supplementalDoc,
  } = params;

  if (!ticket || !ticket.key) {
    throw new Error('Valid ticket details are required for Test Plan generation.');
  }

  const system = buildSystemInstruction();
  const docSection = formatSupplementalDoc(supplementalDoc);

  const prompt = `Generate a comprehensive, strategic Test Plan (STAGE 1 ONLY) for the following requirement:

JIRA TICKET INFORMATION:
- Ticket Key: ${ticket.key}
- Summary: ${ticket.summary}
- Issue Type: ${ticket.issueType}
- Priority: ${ticket.priority}
- Status: ${ticket.status}
- Project: ${ticket.project?.name || ticket.project?.key || 'N/A'}
- Parent/Epic: ${ticket.epic ? `${ticket.epic.key}: ${ticket.epic.summary}` : 'None'}

REQUIREMENT DESCRIPTION:
"""
${ticket.description || 'No description provided.'}
"""

ACCEPTANCE CRITERIA:
"""
${ticket.acceptanceCriteria || 'No explicit acceptance criteria provided.'}
"""
${docSection}
INSTRUCTIONS:
Generate ONLY the Test Plan object. Do NOT generate test cases in this stage. Test cases will be generated in Stage 2 after the test plan is reviewed and approved.

REQUIRED JSON OUTPUT FORMAT (Strictly JSON, no markdown fences):
{
  "testPlan": {
    "title": "Test Plan: [Title reflecting the ticket summary]",
    "ticketKey": "${ticket.key}",
    "scope": "Comprehensive description of what is in scope and out of scope based on the ticket and any uploaded specs",
    "objectives": [
      "Objective 1",
      "Objective 2",
      "Objective 3"
    ],
    "testStrategy": {
      "types": ["Functional", "Negative", "Boundary", "Smoke", "Security"],
      "environments": ["QA / Staging", "Browser Matrix"],
      "entryCriteria": ["Story deployed to QA environment", "Test data prepared"],
      "exitCriteria": ["Zero critical/high defects open", "All acceptance criteria verified"]
    },
    "riskAssessment": [
      "Identified risk 1 and mitigation",
      "Identified risk 2 and mitigation"
    ],
    "warning": ${ticket.hasAcceptanceCriteria ? 'null' : '"Notice: Acceptance Criteria was not explicitly declared in this JIRA ticket. Tests are generated based on description & uploaded specs."'}
  }
}`;

  const raw = await callLlm({ provider, model, apiKey, prompt, system });
  const cleaned = cleanJsonString(raw);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse Test Plan JSON: ${err.message}`);
  }

  const testPlan = parsed.testPlan || parsed;
  const sessionId = uuidv4();
  testPlan.id = sessionId;
  testPlan.createdAt = new Date().toISOString();
  testPlan.ticketKey = ticket.key;
  testPlan.approved = false; // Requires explicit user approval

  return {
    success: true,
    sessionId,
    engineUsed: `${provider}:${model}`,
    testPlan,
    rawJson: parsed,
  };
}

/**
 * STAGE 2: Generates Step-by-Step Test Cases (Enabled ONLY after Test Plan approval)
 */
async function generateTestCases(params = {}) {
  const {
    provider = 'anthropic',
    model = 'claude-3-5-sonnet-20241022',
    apiKey = '',
    ticket,
    approvedTestPlan,
    supplementalDoc,
  } = params;

  if (!ticket || !ticket.key) {
    throw new Error('Valid ticket details are required for Test Cases generation.');
  }
  if (!approvedTestPlan) {
    throw new Error('An approved Test Plan is required before Test Cases can be generated.');
  }

  const system = buildSystemInstruction();
  const docSection = formatSupplementalDoc(supplementalDoc);

  const prompt = `Generate exhaustive, high-coverage Test Cases (STAGE 2) based on the requirement and the APPROVED TEST PLAN below:

JIRA TICKET INFORMATION:
- Ticket Key: ${ticket.key}
- Summary: ${ticket.summary}
- Issue Type: ${ticket.issueType}
- Priority: ${ticket.priority}

REQUIREMENT DESCRIPTION:
"""
${ticket.description || 'No description provided.'}
"""

ACCEPTANCE CRITERIA:
"""
${ticket.acceptanceCriteria || 'No explicit acceptance criteria provided.'}
"""
${docSection}
APPROVED TEST PLAN:
- Title: ${approvedTestPlan.title}
- Scope: ${approvedTestPlan.scope}
- Target Test Types: ${(approvedTestPlan.testStrategy?.types || []).join(', ')}
- Target Environments: ${(approvedTestPlan.testStrategy?.environments || []).join(', ')}

INSTRUCTIONS:
Generate step-by-step test cases strictly adhering to the scope and strategy of the approved Test Plan.
Cover Functional, Negative, Boundary, Security, and Smoke/Sanity scenarios.

REQUIRED JSON OUTPUT FORMAT (Strictly JSON, no markdown fences):
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "Descriptive test case title",
      "type": "Functional | Negative | Boundary | Smoke | Security",
      "priority": "High | Medium | Low | Critical",
      "preconditions": "Preconditions required before executing test",
      "steps": [
        {
          "stepNumber": 1,
          "action": "Action performed by tester",
          "testData": "Input values or payload used",
          "expectedResult": "Expected system behavior"
        }
      ],
      "postconditions": "System state after test execution"
    }
  ]
}`;

  const raw = await callLlm({ provider, model, apiKey, prompt, system });
  const cleaned = cleanJsonString(raw);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse Test Cases JSON: ${err.message}`);
  }

  const rawCases = parsed.testCases || (Array.isArray(parsed) ? parsed : []);
  const testCases = rawCases.map((tc, idx) => ({
    ...tc,
    id: tc.id || `TC-${String(idx + 1).padStart(3, '0')}`,
    linkedStory: ticket.key,
  }));

  return {
    success: true,
    engineUsed: `${provider}:${model}`,
    testCases,
    rawJson: parsed,
  };
}

/**
 * Combined generation (Full Suite)
 */
async function generateTestSuite(params = {}) {
  const planRes = await generateTestPlan(params);
  const casesRes = await generateTestCases({
    ...params,
    approvedTestPlan: planRes.testPlan,
  });

  return {
    success: true,
    sessionId: planRes.sessionId,
    engineUsed: planRes.engineUsed,
    testPlan: planRes.testPlan,
    testCases: casesRes.testCases,
    rawJson: {
      testPlan: planRes.testPlan,
      testCases: casesRes.testCases,
    },
  };
}

module.exports = {
  generateTestPlan,
  generateTestCases,
  generateTestSuite,
};
