import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getDailyGoals,
  updateDailyGoals,
  getAllResumes,
  createResume,
  deleteResume
} from '../tools/db.js';

import { checkOllamaHealth, parseJobDetails } from '../tools/ollama_client.js';
import { fetchJobPageContent } from '../tools/web_scraper.js';
import { assessResumeMatch } from '../tools/resume_scorer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5070;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health and Status Endpoint
app.get('/api/health', async (req, res) => {
  const ollama = await checkOllamaHealth();
  res.json({
    status: 'ok',
    database: 'sqlite-connected',
    ollama
  });
});

// Jobs CRUD
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = getAllJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    const job = getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const job = createJob(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const job = updateJob(req.params.id, req.body);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const result = deleteJob(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Parse & Web Scrape Endpoint
app.post('/api/parse-jd', async (req, res) => {
  try {
    const { rawText, url, sourceHint } = req.body;

    let textToParse = rawText || '';
    let scrapedTitle = '';

    if (url) {
      const scraped = await fetchJobPageContent(url);
      if (!scraped.success) {
        return res.status(400).json({ error: scraped.error });
      }
      textToParse = scraped.rawText;
      scrapedTitle = scraped.pageTitle;
    }

    if (!textToParse || textToParse.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide either a URL or raw text content to parse.' });
    }

    const parsed = await parseJobDetails(textToParse, sourceHint);
    if (scrapedTitle && (!parsed.data.jobTitle || parsed.data.jobTitle === 'Software Engineer')) {
      parsed.data.jobTitle = scrapedTitle.slice(0, 50);
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Web Scrape only
app.post('/api/scrape-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const result = await fetchJobPageContent(url);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resume vs JD Match Scoring Endpoint
app.post('/api/assess-resume', async (req, res) => {
  try {
    const { jdText, resumeText, jobTitle, company } = req.body;
    if (!jdText || !resumeText) {
      return res.status(400).json({ error: 'Both Job Description and Resume text are required.' });
    }

    const assessment = await assessResumeMatch(jdText, resumeText, jobTitle, company);
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Goals Endpoints
app.get('/api/daily-goals', (req, res) => {
  try {
    const goals = getDailyGoals(req.query.date);
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/daily-goals', (req, res) => {
  try {
    const goals = updateDailyGoals(req.body.date, req.body);
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resume Registry Endpoints
app.get('/api/resumes', (req, res) => {
  try {
    const resumes = getAllResumes();
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resumes', (req, res) => {
  try {
    const resume = createResume(req.body);
    res.status(201).json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/resumes/:id', (req, res) => {
  try {
    const result = deleteResume(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if dist folder exists
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Job Tracking Assistant Server running on http://localhost:${PORT}`);
});

