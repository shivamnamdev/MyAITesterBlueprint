const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL = process.env.MODEL || 'llama3.2';

async function verifyLink() {
  console.log(`[Phase 2 Link Verification] Testing connection to Ollama at ${OLLAMA_HOST}...`);

  try {
    // 1. Check API Tags / Health
    const tagsRes = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!tagsRes.ok) {
      throw new Error(`HTTP ${tagsRes.status} on /api/tags`);
    }
    const tagsData = await tagsRes.json();
    const models = (tagsData.models || []).map(m => m.name);
    console.log(`[Link Success] Ollama API connected! Available models:`, models);

    const hasModel = models.some(m => m.includes(MODEL));
    if (!hasModel) {
      console.warn(`[Warning] Model "${MODEL}" not found in available models list.`);
    } else {
      console.log(`[Model Verified] "${MODEL}" is available and ready.`);
    }

    // 2. Perform Handshake Generation Call
    console.log(`[Handshake] Sending test prompt to Ollama with model "${MODEL}"...`);
    const genRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: 'Respond with JSON: {"status": "ok", "message": "handshake successful"}',
        format: 'json',
        stream: false
      })
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      throw new Error(`HTTP ${genRes.status} on /api/generate: ${errText}`);
    }

    const genData = await genRes.json();
    console.log(`[Handshake Output]`, genData.response);
    console.log(`✅ [Phase 2 Link Verification PASSED] External Ollama service is fully operational.`);
  } catch (err) {
    console.error(`❌ [Phase 2 Link Verification FAILED]`, err.message);
    process.exit(1);
  }
}

verifyLink();
