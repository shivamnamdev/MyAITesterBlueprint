/**
 * Resume vs. Job Description Scorer & Prospect Assessor
 * Generates a 1-10 rating, prospect bar metric, strengths, gaps, and tailoring tips.
 */

import { checkOllamaHealth } from './ollama_client.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export async function assessResumeMatch(jdText, resumeText, jobTitle = '', company = '') {
  if (!jdText || !resumeText) {
    return {
      success: false,
      error: 'Both Job Description and Resume text are required for assessment.'
    };
  }

  const health = await checkOllamaHealth();

  if (health.online) {
    try {
      const selectedModel = health.models.find(m => m.includes(OLLAMA_MODEL)) || health.models[0]?.name || OLLAMA_MODEL;
      const prompt = `You are a Principal Tech Recruiter and hiring manager evaluating a candidate's resume for a specific job opening.
Job Title: ${jobTitle}
Company: ${company}

Job Description:
"""${jdText.slice(0, 3000)}"""

Candidate Resume:
"""${resumeText.slice(0, 3000)}"""

Evaluate how well the resume matches the JD.
Return ONLY a valid JSON object with these exact keys:
{
  "ratingOutOfTen": 8.5,
  "percentage": 85,
  "ratingLabel": "High Prospect | Moderate Prospect | Low Prospect",
  "strengths": ["Array of 3 to 5 matching skills or experiences found in resume"],
  "gaps": ["Array of 2 to 4 key technologies or requirements in JD missing from resume"],
  "tailoringTips": ["Array of 2 to 3 specific bullet point improvements or phrasing changes"]
}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.2 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const result = await response.json();
        const parsed = JSON.parse(result.response);
        const score = Math.min(10, Math.max(1, Number(parsed.ratingOutOfTen) || 7.0));
        return {
          success: true,
          score: Math.round(score * 10) / 10,
          ratingOutOfTen: Math.round(score * 10) / 10,
          percentage: Math.min(100, Math.max(10, Math.round(score * 10))),
          ratingLabel: parsed.ratingLabel || getProspectLabel(score),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Relevant background'],
          gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
          tailoringTips: Array.isArray(parsed.tailoringTips) ? parsed.tailoringTips : ['Highlight relevant keywords from the JD'],
          engineUsed: `ollama (${selectedModel})`
        };
      }
    } catch (err) {
      console.warn('Ollama resume scoring failed, using heuristic scorer:', err.message);
    }
  }

  // Fallback to Heuristic Vector/Keyword Scorer
  return heuristicResumeScore(jdText, resumeText, jobTitle);
}

function heuristicResumeScore(jdText, resumeText, jobTitle = '') {
  const commonTech = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'react', 'next.js', 'node.js', 'express',
    'selenium', 'playwright', 'cypress', 'appium', 'testng', 'junit', 'pytest', 'cucumber', 'bdd',
    'rest', 'graphql', 'api testing', 'postman', 'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure',
    'ci/cd', 'github actions', 'jenkins', 'git', 'sql', 'postgresql', 'sqlite', 'mongodb',
    'performance testing', 'jmeter', 'k6', 'loadrunner', 'security testing', 'owasp',
    'agile', 'scrum', 'jira', 'confluence', 'automation architecture', 'framework design',
    'page object model', 'pom', 'llm', 'generative ai', 'ai testing', 'prompt engineering'
  ];

  const jdLower = jdText.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const jdMatchedTech = commonTech.filter(tech => jdLower.includes(tech));
  const candidateMatchedTech = jdMatchedTech.filter(tech => resumeLower.includes(tech));
  const missingTech = jdMatchedTech.filter(tech => !resumeLower.includes(tech));

  // Additional term overlap
  const jdWords = extractKeywords(jdLower);
  const resumeWordsSet = new Set(extractKeywords(resumeLower));
  const commonKeywords = jdWords.filter(w => resumeWordsSet.has(w));

  const keywordRatio = jdWords.length > 0 ? (commonKeywords.length / Math.min(jdWords.length, 60)) : 0.5;
  const techRatio = jdMatchedTech.length > 0 ? (candidateMatchedTech.length / jdMatchedTech.length) : 0.6;

  // Blended score out of 10
  let rawScore = (techRatio * 6.5) + (keywordRatio * 3.5);
  if (jobTitle && resumeLower.includes(jobTitle.toLowerCase())) {
    rawScore += 0.8;
  }

  const score = Math.min(10.0, Math.max(3.5, Math.round(rawScore * 10) / 10));
  const percentage = Math.round(score * 10);

  const strengths = candidateMatchedTech.slice(0, 5).map(capitalize) || ['Fundamental tech skills matched'];
  if (strengths.length === 0 && commonKeywords.length > 0) {
    strengths.push(...commonKeywords.slice(0, 4).map(capitalize));
  }

  const gaps = missingTech.slice(0, 4).map(capitalize);

  const tailoringTips = [
    gaps.length > 0
      ? `Explicitly add keywords: ${gaps.join(', ')} into your experience bullet points.`
      : 'Include quantified business metrics (e.g., % time saved or defects prevented).',
    `Align your summary title directly with '${jobTitle || 'the target role'}'.`
  ];

  return {
    success: true,
    score,
    ratingOutOfTen: score,
    percentage,
    ratingLabel: getProspectLabel(score),
    strengths,
    gaps,
    tailoringTips,
    engineUsed: 'heuristic-keyword-scorer'
  };
}

function getProspectLabel(score) {
  if (score >= 8.0) return 'High Prospect / Top Candidate';
  if (score >= 6.0) return 'Moderate Prospect / Good Fit';
  return 'Low Prospect / Needs Heavy Tailoring';
}

function extractKeywords(text) {
  const words = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  return Array.from(new Set(words));
}

function capitalize(s) {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const stopWords = new Set([
  'about', 'above', 'after', 'again', 'against', 'all', 'and', 'any', 'are', 'because',
  'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'into', 'its', 'itself', 'just', 'more', 'most', 'myself', 'nor', 'not',
  'now', 'off', 'once', 'only', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'some', 'such', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'too', 'under', 'until', 'very', 'was', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
]);
