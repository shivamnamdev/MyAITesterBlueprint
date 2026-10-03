const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function triggerWebhook() {
  const feature = process.argv[2] || 'User Profile editing with Avatar upload and Password change validation';
  console.log(`[Phase 5 Automation Trigger] Sending Webhook trigger request to ${APP_URL}/api/webhook/generate...`);

  try {
    const res = await fetch(`${APP_URL}/api/webhook/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature_description: feature,
        test_type: 'All'
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ [Webhook Response] Received ${data.payload.test_cases.length} test cases for "${data.payload.feature_name}"`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ [Webhook Trigger Failed]`, err.message);
    process.exit(1);
  }
}

triggerWebhook();
