# SOP: Job Kanban Board State & Persistence Lifecycle

## 1. Objective
Define deterministic lifecycle transitions for job cards on the Kanban board, persistence rules in SQLite, and daily quota calculations.

## 2. Stage Definitions & Workflow
The board implements 6 deterministic stages:
1. `To Search`: Leads discovered, bookmark links, or companies of interest to investigate.
2. `To Apply`: Active job vacancies ready for application. Resume tailored or selected.
3. `Applied`: Application submitted. Requires `appliedDate`, `platformApplied`, and `resumeUsed`.
4. `Interviewing`: In active conversations, screening, or technical rounds. Requires `contactPerson` or interview notes.
5. `Offer`: Formal or verbal employment offer received.
6. `Rejected`: Application closed without an offer or archived.

## 3. Daily Tracking Logic
- Daily targets default: 10 Searched, 5 Applied (customizable by user).
- When a job transitions into `To Apply` or `Applied` on a given date:
  - If `stage == 'Applied'` and `appliedDate == Today`: increment `actualApplied`.
  - If created in `To Search` or `To Apply` today: increment `actualSearched`.
- Daily goals are recorded per calendar day `YYYY-MM-DD` in the `daily_goals` table.

## 4. SQLite Schema & Indexing
- Table `jobs`:
  - `id` TEXT PRIMARY KEY
  - `job_title` TEXT NOT NULL
  - `company` TEXT NOT NULL
  - `job_url` TEXT
  - `source_received` TEXT
  - `platform_applied` TEXT
  - `resume_used` TEXT
  - `resume_text` TEXT
  - `jd_text` TEXT
  - `stage` TEXT NOT NULL
  - `match_score` REAL DEFAULT 0.0
  - `match_breakdown` TEXT (JSON stringified)
  - `salary_range` TEXT
  - `location` TEXT
  - `contact_person` TEXT
  - `applied_date` TEXT
  - `follow_up_date` TEXT
  - `notes` TEXT
  - `created_at` TEXT NOT NULL
  - `updated_at` TEXT NOT NULL
- Table `resumes`:
  - `id` TEXT PRIMARY KEY
  - `name` TEXT NOT NULL
  - `target_role` TEXT
  - `content_text` TEXT NOT NULL
  - `created_at` TEXT NOT NULL
- Table `daily_goals`:
  - `date` TEXT PRIMARY KEY
  - `target_searches` INTEGER DEFAULT 10
  - `target_applications` INTEGER DEFAULT 5
  - `actual_searched` INTEGER DEFAULT 0
  - `actual_applied` INTEGER DEFAULT 0
  - `updated_at` TEXT NOT NULL

