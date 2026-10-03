import { buildMasterPrompt } from '../src/prompts/master_prompt.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL = process.env.MODEL || 'llama3.2';

export async function generateTestCases(featureDescription, testType = 'All') {
  const prompt = buildMasterPrompt(featureDescription, testType);

  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt,
      format: 'json',
      stream: false,
      options: { temperature: 0.2 }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama API Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  let text = result.response.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    text = text.substring(start, end + 1);
  }

  return JSON.parse(text);
}

// CLI runner if invoked directly
if (process.argv[1].endsWith('generate_testcases.js')) {
  const feature = process.argv[2] || 'Login page with Email, Password, Remember Me, Submit button';
  console.log(`[CLI Tool] Generating test cases for feature: "${feature}"...`);
  generateTestCases(feature)
    .then(data => {
      console.log('\n[GENERATED TEST SUITE RESULT]:');
      console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      console.error('[CLI Error]', err);
      process.exit(1);
    });
}
