import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'jobs.db');
export const db = new DatabaseSync(dbPath);

// Initialize Tables and Indexes
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      job_title TEXT NOT NULL,
      company TEXT NOT NULL,
      job_url TEXT,
      source_received TEXT,
      platform_applied TEXT,
      resume_used TEXT,
      resume_text TEXT,
      jd_text TEXT,
      stage TEXT NOT NULL DEFAULT 'To Search',
      match_score REAL DEFAULT 0.0,
      match_breakdown TEXT,
      salary_range TEXT,
      location TEXT,
      contact_person TEXT,
      applied_date TEXT,
      follow_up_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_role TEXT,
      content_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_goals (
      date TEXT PRIMARY KEY,
      target_searches INTEGER DEFAULT 10,
      target_applications INTEGER DEFAULT 5,
      actual_searched INTEGER DEFAULT 0,
      actual_applied INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed sample resumes if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM resumes');
  const countRes = countStmt.get();
  if (countRes.count === 0) {
    const seedStmt = db.prepare(`
      INSERT INTO resumes (id, name, target_role, content_text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    seedStmt.run(
      'res_sdet',
      'SDET & Automation Lead Resume',
      'Lead QA Automation / SDET',
      `Senior QA Automation Architect with 8+ years specializing in Selenium, Playwright, TypeScript, Python, Cypress, CI/CD pipelines (GitHub Actions, Jenkins), Docker, API Testing (REST, GraphQL), Performance Testing (JMeter, k6), and AI-driven test frameworks. Proven track record leading testing teams and reducing release regression time by 60%.`,
      new Date().toISOString()
    );
    seedStmt.run(
      'res_fullstack',
      'Full Stack Software Engineer Resume',
      'Senior Full Stack Engineer',
      `Full Stack Software Engineer with expertise in React, TypeScript, Node.js, Express, Next.js, Python FastAPI, PostgreSQL, SQLite, and cloud deployments (AWS, GCP). Passionate about responsive UI design, scalable microservices, and AI integrations.`,
      new Date().toISOString()
    );
  }
}

// Job operations
export function getAllJobs() {
  const stmt = db.prepare('SELECT * FROM jobs ORDER BY updated_at DESC');
  const rows = stmt.all();
  return rows.map(formatJobRow);
}

export function getJobById(id) {
  const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
  const row = stmt.get(id);
  return row ? formatJobRow(row) : null;
}

export function createJob(data) {
  const id = data.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // Set appliedDate if creating directly into an applied state
  let appliedDate = data.appliedDate || null;
  if (['Applied', 'Interviewing', 'Offer'].includes(data.stage)) {
    if (!appliedDate) appliedDate = today;
  } else {
    appliedDate = null;
  }

  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, job_title, company, job_url, source_received, platform_applied,
      resume_used, resume_text, jd_text, stage, match_score, match_breakdown,
      salary_range, location, contact_person, applied_date, follow_up_date,
      notes, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const breakdownJson = typeof data.matchBreakdown === 'object' 
    ? JSON.stringify(data.matchBreakdown) 
    : (data.matchBreakdown || null);

  stmt.run(
    id,
    data.jobTitle || 'Untitled Position',
    data.company || 'Unknown Company',
    data.jobUrl || null,
    data.sourceReceived || 'LinkedIn',
    data.platformApplied || 'Company Portal',
    data.resumeUsed || null,
    data.resumeText || null,
    data.jdText || null,
    data.stage || 'To Search',
    data.matchScore != null ? Number(data.matchScore) : 0.0,
    breakdownJson,
    data.salaryRange || null,
    data.location || null,
    data.contactPerson || null,
    appliedDate,
    data.followUpDate || null,
    data.notes || null,
    now,
    now
  );

  return getJobById(id);
}

export function updateJob(id, data) {
  const existing = getJobById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const updated = {
    ...existing,
    ...data,
    updatedAt: now
  };

  // Deterministic appliedDate lifecycle based on stage transitions
  if (data.stage) {
    if (['Applied', 'Interviewing', 'Offer'].includes(data.stage)) {
      if (!updated.appliedDate) {
        updated.appliedDate = today;
      }
    } else if (data.stage === 'To Search' || data.stage === 'To Apply') {
      // If moved back to pre-application stage, clear appliedDate
      updated.appliedDate = null;
    }
  }

  const breakdownJson = typeof updated.matchBreakdown === 'object'
    ? JSON.stringify(updated.matchBreakdown)
    : (updated.matchBreakdown || null);

  const stmt = db.prepare(`
    UPDATE jobs SET
      job_title = ?,
      company = ?,
      job_url = ?,
      source_received = ?,
      platform_applied = ?,
      resume_used = ?,
      resume_text = ?,
      jd_text = ?,
      stage = ?,
      match_score = ?,
      match_breakdown = ?,
      salary_range = ?,
      location = ?,
      contact_person = ?,
      applied_date = ?,
      follow_up_date = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.jobTitle,
    updated.company,
    updated.jobUrl,
    updated.sourceReceived,
    updated.platformApplied,
    updated.resumeUsed,
    updated.resumeText,
    updated.jdText,
    updated.stage,
    updated.matchScore != null ? Number(updated.matchScore) : 0.0,
    breakdownJson,
    updated.salaryRange,
    updated.location,
    updated.contactPerson,
    updated.appliedDate,
    updated.followUpDate,
    updated.notes,
    now,
    id
  );

  return getJobById(id);
}

export function deleteJob(id) {
  const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
  stmt.run(id);
  return { success: true, id };
}

// Daily Goals operations
export function getDailyGoals(date) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const stmt = db.prepare('SELECT * FROM daily_goals WHERE date = ?');
  let row = stmt.get(targetDate);
  const now = new Date().toISOString();

  if (!row) {
    const insertStmt = db.prepare(`
      INSERT INTO daily_goals (date, target_searches, target_applications, actual_searched, actual_applied, updated_at)
      VALUES (?, 10, 5, 0, 0, ?)
    `);
    insertStmt.run(targetDate, now);
    row = stmt.get(targetDate);
  }

  // Exact live counts from jobs table across each stage
  const countsStmt = db.prepare(`
    SELECT
      SUM(CASE WHEN stage = 'To Search' THEN 1 ELSE 0 END) as toSearchCount,
      SUM(CASE WHEN stage = 'To Apply' THEN 1 ELSE 0 END) as toApplyCount,
      SUM(CASE WHEN stage = 'Applied' THEN 1 ELSE 0 END) as appliedCount,
      SUM(CASE WHEN stage = 'Interviewing' THEN 1 ELSE 0 END) as interviewCount,
      SUM(CASE WHEN stage = 'Offer' THEN 1 ELSE 0 END) as offerCount,
      SUM(CASE WHEN stage = 'Rejected' THEN 1 ELSE 0 END) as rejectedCount
    FROM jobs
  `);
  const counts = countsStmt.get();

  const toSearchCount = counts?.toSearchCount || 0;
  const toApplyCount = counts?.toApplyCount || 0;
  const appliedCount = counts?.appliedCount || 0;
  const interviewCount = counts?.interviewCount || 0;
  const offerCount = counts?.offerCount || 0;
  const rejectedCount = counts?.rejectedCount || 0;

  return {
    date: targetDate,
    targetSearches: row.target_searches,
    targetApplications: row.target_applications,
    toSearchCount,
    toApplyCount,
    appliedCount,
    interviewCount,
    offerCount,
    rejectedCount,
    actualSearched: toSearchCount,
    actualApplied: toApplyCount,
    updatedAt: now
  };
}

export function updateDailyGoals(date, data) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  // If daily_goals row doesn't exist, create it first
  getDailyGoals(targetDate);

  const stmt = db.prepare(`
    UPDATE daily_goals SET
      target_searches = COALESCE(?, target_searches),
      target_applications = COALESCE(?, target_applications),
      updated_at = ?
    WHERE date = ?
  `);

  stmt.run(
    data.targetSearches != null ? data.targetSearches : null,
    data.targetApplications != null ? data.targetApplications : null,
    now,
    targetDate
  );

  return getDailyGoals(targetDate);
}

// Resumes registry operations
export function getAllResumes() {
  const stmt = db.prepare('SELECT * FROM resumes ORDER BY created_at DESC');
  const rows = stmt.all();
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    targetRole: r.target_role,
    contentText: r.content_text,
    createdAt: r.created_at
  }));
}

export function createResume(data) {
  const id = data.id || `res_${Date.now()}`;
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO resumes (id, name, target_role, content_text, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.name, data.targetRole || null, data.contentText || '', now);
  return { id, name: data.name, targetRole: data.targetRole, contentText: data.contentText, createdAt: now };
}

export function deleteResume(id) {
  const stmt = db.prepare('DELETE FROM resumes WHERE id = ?');
  stmt.run(id);
  return { success: true, id };
}

function formatJobRow(row) {
  let breakdown = null;
  if (row.match_breakdown) {
    try {
      breakdown = JSON.parse(row.match_breakdown);
    } catch {
      breakdown = null;
    }
  }

  return {
    id: row.id,
    jobTitle: row.job_title,
    company: row.company,
    jobUrl: row.job_url,
    sourceReceived: row.source_received,
    platformApplied: row.platform_applied,
    resumeUsed: row.resume_used,
    resumeText: row.resume_text,
    jdText: row.jd_text,
    stage: row.stage,
    matchScore: row.match_score,
    matchBreakdown: breakdown,
    salaryRange: row.salary_range,
    location: row.location,
    contactPerson: row.contact_person,
    appliedDate: row.applied_date,
    followUpDate: row.follow_up_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Initialize on module load
initDatabase();

