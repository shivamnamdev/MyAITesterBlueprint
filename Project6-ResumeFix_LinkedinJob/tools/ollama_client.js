/**
 * Ollama Client & Fallback Heuristic Parser
 * Communicates with local Ollama or deterministically falls back to regex/heuristics.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function checkOllamaHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { online: false, models: [] };
    const data = await res.json();
    return {
      online: true,
      models: (data.models || []).map(m => m.name)
    };
  } catch {
    return { online: false, models: [] };
  }
}

export async function parseJobDetails(rawText, sourceHint = '') {
  const health = await checkOllamaHealth();

  if (health.online) {
    try {
      const selectedModel = health.models.find(m => m.includes(OLLAMA_MODEL)) || health.models[0]?.name || OLLAMA_MODEL;
      const prompt = `You are an expert recruitment assistant. Extract the job details from the following raw text into a clean JSON object.
Text:
"""${rawText.slice(0, 4000)}"""

Return ONLY a valid JSON object with these exact keys:
{
  "jobTitle": "Extracted job title or role name",
  "company": "Company name",
  "location": "Job location, e.g. Remote, Hybrid - City, or Onsite",
  "salaryRange": "Salary or compensation if mentioned, else empty string",
  "sourceReceived": "Where did the user see this (e.g. LinkedIn, Indeed, Referral, Recruiter, Email)",
  "platformApplied": "Where to apply (e.g. Company Portal, LinkedIn Easy Apply, Greenhouse, Lever)",
  "jdText": "Cleaned summary of key responsibilities and requirements",
  "contactPerson": "Recruiter, hiring manager, or referrer name if mentioned"
}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.1 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const result = await response.json();
        const parsed = JSON.parse(result.response);
        return {
          success: true,
          data: {
            jobTitle: parsed.jobTitle || 'Extracted Position',
            company: parsed.company || 'Unknown Company',
            location: parsed.location || 'Remote',
            salaryRange: parsed.salaryRange || '',
            sourceReceived: parsed.sourceReceived || sourceHint || 'LinkedIn',
            platformApplied: parsed.platformApplied || 'Company Portal',
            jdText: parsed.jdText || rawText.slice(0, 1000),
            contactPerson: parsed.contactPerson || ''
          },
          engineUsed: `ollama (${selectedModel})`
        };
      }
    } catch (err) {
      console.warn('Ollama parsing failed or timed out, falling back to heuristic parser:', err.message);
    }
  }

  // Fallback to Heuristic Parser
  return {
    success: true,
    data: heuristicParse(rawText, sourceHint),
    engineUsed: 'rule-based-fallback'
  };
}

function heuristicParse(text, sourceHint = '') {
  const clean = text.replace(/\r\n/g, '\n').trim();
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Detect Company
  let company = 'Target Company';
  const companyMatch = clean.match(/(?:at|company:\s*|employer:\s*|organization:\s*|with\s+)([A-Z][A-Za-z0-9&.,]{1,30})(?:\s+(?:in|for|as|is|\(|\n|\.|\s-\s|,)|$)/i);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  } else {
    const fallbackMatch = clean.match(/(?:at|company:?)\s+([A-Z][A-Za-z0-9&]{1,25})/);
    if (fallbackMatch) company = fallbackMatch[1].trim();
    else if (lines.length > 1 && lines[0].length < 40 && !lines[0].toLowerCase().includes('job')) {
      company = lines[0];
    }
  }

  // 2. Detect Job Title
  let jobTitle = 'Software Engineer';
  const rolePatterns = [
    /(?:Staff|Senior|Lead|Principal|Junior|Mid-level)?\s*(?:QA|Quality Assurance|SDET|Test Automation|Automation Engineer|Test Lead)/i,
    /(?:Staff|Senior|Lead|Principal)?\s*(?:Software Engineer|Full Stack Developer|Frontend Developer|Backend Developer|DevOps Engineer|Cloud Architect|Site Reliability Engineer)/i,
    /(?:Product Manager|Technical Project Manager|Engineering Manager|Data Engineer|ML Engineer)/i
  ];

  for (const pattern of rolePatterns) {
    const match = clean.match(pattern);
    if (match) {
      jobTitle = match[0].trim();
      break;
    }
  }

  // 3. Detect Location
  let location = 'Remote';
  if (/hybrid/i.test(clean)) {
    const locMatch = clean.match(/hybrid(?:\s*-\s*|\s*,\s*|\s+in\s+)?([A-Za-z\s,]+)/i);
    location = locMatch ? `Hybrid - ${locMatch[1].trim().slice(0, 30)}` : 'Hybrid';
  } else if (/remote/i.test(clean)) {
    location = 'Remote';
  } else {
    const cityMatch = clean.match(/(?:in|location:?)\s*([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/);
    if (cityMatch) location = cityMatch[1];
  }

  // 4. Detect Salary
  let salaryRange = '';
  const salaryMatch = clean.match(/\$\s*\d{2,3}(?:,\d{3})*(?:\s*-\s*\$?\s*\d{2,3}(?:,\d{3})*)?(?:\s*(?:k|yr|year|annually|\/hr))?/i);
  if (salaryMatch) {
    salaryRange = salaryMatch[0].replace(/\s+/g, ' ').trim();
  }

  // 5. Detect Source & Platform
  let sourceReceived = sourceHint || 'LinkedIn';
  if (/linkedin/i.test(clean)) sourceReceived = 'LinkedIn';
  else if (/indeed/i.test(clean)) sourceReceived = 'Indeed';
  else if (/wellfound|angellist/i.test(clean)) sourceReceived = 'Wellfound';
  else if (/referral|referred/i.test(clean)) sourceReceived = 'Referral';

  let platformApplied = 'Company Portal';
  if (/easy apply/i.test(clean)) platformApplied = 'LinkedIn Easy Apply';
  else if (/greenhouse/i.test(clean)) platformApplied = 'Greenhouse';
  else if (/lever\.co/i.test(clean)) platformApplied = 'Lever';
  else if (/workday/i.test(clean)) platformApplied = 'Workday';

  return {
    jobTitle,
    company,
    location,
    salaryRange,
    sourceReceived,
    platformApplied,
    jdText: clean.slice(0, 3000),
    contactPerson: ''
  };
}
