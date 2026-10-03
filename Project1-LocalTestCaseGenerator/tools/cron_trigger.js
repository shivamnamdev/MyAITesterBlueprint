/**
 * Phase 5 Trigger: Scheduled Cron / Polling Listener Script
 * Periodically executes test case generation audits for defined key user flows.
 */

import { generateTestCases } from './generate_testcases.js';

const FEATURE_AUDIT_LIST = [
  'User Login & Multi-Factor Authentication',
  'Shopping Cart Checkout & Stripe Payment',
  'User Profile & Password Reset Flow'
];

async function runScheduledAudit() {
  console.log(`\n⏰ [Cron Trigger - ${new Date().toISOString()}] Starting scheduled QA audit...`);

  for (const feature of FEATURE_AUDIT_LIST) {
    try {
      console.log(`\n🔍 [Audit] Processing feature: "${feature}"...`);
      const suite = await generateTestCases(feature, 'All');
      console.log(`✅ [Audit Passed] Generated ${suite.test_cases.length} test cases for "${suite.feature_name}".`);
    } catch (err) {
      console.error(`❌ [Audit Failed] Feature "${feature}": ${err.message}`);
    }
  }

  console.log(`\n🎉 [Cron Trigger Complete] All scheduled feature audits finished.`);
}

runScheduledAudit();
