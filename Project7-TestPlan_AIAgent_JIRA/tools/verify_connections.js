/**
 * tools/verify_connections.js
 * Phase 2 — Standalone CLI runner to verify all service connections.
 * Run with: npm run verify
 */

'use strict';

require('dotenv').config();
const jira = require('./jira_client');
const anthropic = require('./anthropic_client');
const gemini = require('./gemini_client');
const ollama = require('./ollama_client');
const gdocs = require('./gdocs_client');

const CHECK = '✅';
const CROSS = '❌';
const WARN = '⚠️ ';
const INFO = 'ℹ️ ';

async function verify() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' ⚡ Phase 2: Link Verification — TestPlan AI Agent');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let jiraOk = false;
  let llmOk = false;

  // ── 1. JIRA Connection ───────────────────────────────────────────────────────
  process.stdout.write('1. JIRA REST API ... ');
  const jiraUrl = process.env.JIRA_BASE_URL || '';
  const jiraToken = process.env.JIRA_API_TOKEN || '';

  if (!jiraUrl || jiraUrl.includes('your-org.atlassian.net') || !jiraToken || jiraToken.includes('your_jira_api_token_here')) {
    console.log(`${WARN} NOT CONFIGURED IN .env`);
    console.log('   ➜ You can configure JIRA directly via the Web UI at http://localhost:5080');
    console.log('   ➜ Or add real credentials to .env: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN\n');
  } else {
    try {
      const r = await jira.testConnection();
      console.log(`${CHECK} CONNECTED`);
      console.log(`   User:    ${r.user?.displayName || r.user}`);
      console.log(`   Base:    ${r.baseUrl}`);
      if (r.project) {
        console.log(`   Project: ${r.project.name} (${r.project.key})`);
      }
      console.log('');
      jiraOk = true;
    } catch (err) {
      console.log(`${CROSS} FAILED`);
      console.log(`   Error: ${err.message}\n`);
    }
  }

  // ── 2. Anthropic Claude (Default Cloud Model) ──────────────────────────────
  process.stdout.write('2. Anthropic Claude API ... ');
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';

  if (!anthropicKey || anthropicKey.includes('your_anthropic_api_key_here')) {
    console.log(`${WARN} NO KEY IN .env`);
    console.log('   ➜ You can paste your Anthropic API Key directly into the Web UI');
    console.log('   ➜ Or set ANTHROPIC_API_KEY in .env (get key from https://console.anthropic.com/settings/keys)\n');
  } else {
    try {
      const r = await anthropic.testConnection(anthropicKey);
      console.log(`${CHECK} CONNECTED`);
      console.log(`   Model: ${r.modelUsed}`);
      console.log(`   Ping:  ${r.reply}\n`);
      llmOk = true;
    } catch (err) {
      console.log(`${CROSS} FAILED`);
      console.log(`   Error: ${err.message}\n`);
    }
  }

  // ── 3. Google Gemini (Alternative Cloud Model) ─────────────────────────────
  process.stdout.write('3. Google Gemini API ... ');
  const geminiKey = process.env.GEMINI_API_KEY || '';

  if (!geminiKey || geminiKey.includes('your_gemini_api_key_here')) {
    console.log(`${WARN} NO KEY IN .env (Optional alternative)`);
    console.log('   ➜ Set GEMINI_API_KEY in .env if you wish to use Gemini\n');
  } else {
    try {
      const r = await gemini.testConnection(geminiKey);
      console.log(`${CHECK} CONNECTED`);
      console.log(`   Model: ${r.model} (temp=${r.temperature})\n`);
      llmOk = true;
    } catch (err) {
      console.log(`${CROSS} FAILED`);
      console.log(`   Error: ${err.message}\n`);
    }
  }

  // ── 4. Local Ollama (Offline Engine) ───────────────────────────────────────
  process.stdout.write('4. Local Ollama (Offline) ... ');
  const ollamaStatus = await ollama.getOllamaStatus();
  if (ollamaStatus.available) {
    console.log(`${CHECK} ONLINE`);
    console.log(`   Host:   ${ollamaStatus.host}`);
    console.log(`   Models: ${ollamaStatus.models.map((m) => m.name).join(', ') || 'None pulled yet'}\n`);
    llmOk = true;
  } else {
    console.log(`${INFO} OFFLINE (Optional)`);
    console.log(`   ${ollamaStatus.error}\n`);
  }

  // ── 5. Google Docs (Optional Export) ────────────────────────────────────────
  process.stdout.write('5. Google Docs API (Optional) ... ');
  const gd = gdocs.checkCredentials();
  if (gd.configured) {
    console.log(`${CHECK} CONFIGURED`);
    console.log(`   Client ID: ${gd.clientId}\n`);
  } else {
    console.log(`${INFO} NOT CONFIGURED (Optional)\n`);
  }

  // ── Summary & Phase 2 Gate ─────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' 📋 Phase 2 Link Status Summary:');
  console.log(`    JIRA Connectivity:      ${jiraOk ? `${CHECK} Verified` : `${WARN} Web UI / .env credentials needed`}`);
  console.log(`    LLM Engine (at least 1): ${llmOk ? `${CHECK} Verified` : `${WARN} Key needed in UI or .env`}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (jiraOk && llmOk) {
    console.log(`${CHECK} Phase 2 Link verification fully PASSED. Ready for Phase 3.\n`);
    process.exit(0);
  } else {
    console.log(`${INFO} Note: Credentials can be supplied either in .env or dynamically`);
    console.log('      via the interactive Web UI at http://localhost:5080\n');
  }
}

verify();
