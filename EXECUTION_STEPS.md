# MyAITesterBlueprint - Master Projects Execution Guide

This document contains step-by-step instructions to set up, configure, and execute all projects in the **MyAITesterBlueprint** repository.

---

## 📌 Project 1: Local TestCase Generator (`Project1-LocalTestCaseGenerator`)

### Overview
A Node.js & Express application leveraging local LLMs (via Ollama & Llama 3.2) to generate standard test cases from user prompts and feature requirements.

### Prerequisites
* **Node.js**: v18.0+
* **Ollama**: Installed and running locally (`ollama serve`)
* **Model**: Llama 3.2 (`ollama pull llama3.2`)

### Execution Steps
```bash
# 1. Navigate to Project 1 directory
cd Project1-LocalTestCaseGenerator

# 2. Install Node.js dependencies (first time only)
npm install

# 3. Start the application server
npm start

# For development mode with auto-reload:
npm run dev
```
* **Access URL**: `http://localhost:3000`

---

## 📌 Project 2: Selenium to Playwright LLM Converter (`Project2-Selenium2PlaywrightLLM`)

### Overview
A Python CLI tool operating on the B.L.A.S.T. protocol to convert legacy Selenium Java Page Object Model (POM) scripts into modern Playwright TypeScript code using local LLM models.

### Prerequisites
* **Python**: v3.10+
* **Ollama**: Running locally with target code models installed (e.g. `codellama:latest` or `llama3.2`)

### Execution Steps
```bash
# 1. Navigate to Project 2 directory
cd Project2-Selenium2PlaywrightLLM

# 2. Ensure executable permissions for convert.sh script
chmod +x convert.sh

# 3. Execute conversion CLI runner
./convert.sh ATB4xSeleniumAdvanceFramework/src/main/java/com/thetestingacademy/pages/PageObjectModel/LoginPage_POM.java playwright_output codellama:latest
```
* **Converted Output Directory**: `Project2-Selenium2PlaywrightLLM/playwright_output`

---

## 📌 Project 3: Salesforce Enterprise Selenium Framework (`Project3-RICE_POT_PromptFramework`)

### Overview
An enterprise-grade Selenium WebDriver + Java + Maven + TestNG automation framework implementing Page Object Model with `PageFactory`, 100% XPath locators, and `WebDriverWait` synchronization for Salesforce Login UI testing.

### Prerequisites
* **Java JDK**: Version 17 or higher
* **Apache Maven**: Version 3.8+
* **Google Chrome**: Installed on host machine

### Execution Steps
```bash
# 1. Navigate to Project 3 directory
cd Project3-RICE_POT_PromptFramework

# 2. Ensure Maven and Java are in PATH (macOS Homebrew example)
export PATH=$PATH:/opt/homebrew/bin

# 3. Compile and execute TestNG test suite
mvn clean test
```
* **Test Reports**: Generated under `target/surefire-reports/index.html`

---

## 📌 Project 5: Chat-Driven Bug Report Generator (`Project5-CaludeCodeBugReport`)

### Overview
A Python Flask app with a chat UI. Describe a bug in plain language and a local LLM (Ollama) builds a structured, styled bug report live (summary, steps, expected/actual, severity, etc.). Export via Copy Markdown, Download HTML, or Print/PDF. Falls back to a simple rule-based extractor if Ollama is not running.

### Prerequisites
* **Python**: v3.9+
* **Ollama** (optional, recommended): running locally with `llama3.2` (`ollama pull llama3.2`). Override with `OLLAMA_MODEL` / `OLLAMA_URL`.

### Execution Steps
```bash
# 1. Navigate to Project 5 directory
cd Project5-CaludeCodeBugReport

# 2. Create virtualenv and install dependencies (first time only)
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# 3. (Optional) start Ollama in another terminal
ollama serve

# 4. Start the app
.venv/bin/python app.py
```
* **Access URL**: `http://localhost:5055` (change with `PORT=xxxx`)

---

## 📌 Project 6: Job Tracking Board Assistant & AI Matcher (`Project6-ResumeFix_LinkedinJob`)

### Overview
A B.L.A.S.T.-architected local Kanban board assistant to manage your end-to-end job hunting journey. Tracks daily job search & application quotas, features smart one-click auto-fill from unstructured text or live JD URLs (online scraping), provides local SQLite ACID persistence, and evaluates resume-to-JD fit with a 1-10 rating, prospect potential bar, matching strengths, gaps, and tailoring tips via local Ollama (with instant heuristic fallback).

### Prerequisites
* **Node.js**: v18.0+ (Node v26 recommended)
* **Ollama** (optional, recommended): running locally with `llama3.2` (`ollama serve`)

### Execution Steps
```bash
# 1. Navigate to Project 6 directory
cd Project6-ResumeFix_LinkedinJob

# 2. Launch using one-click startup script (handles dependencies & build automatically)
chmod +x start.sh
./start.sh

# Or start directly with npm:
npm start

# For development mode with hot reload:
npm run dev
```
* **Access URL**: `http://localhost:5095` (change with `PORT=xxxx`)

---

## 📌 Individual Project: Ultimate Prompt Generator (`Individual-Projects/Ultimate-Prompt-Generator`)

### Overview
A B.L.A.S.T.-architected Web application and deterministic compiler based on the 10 Prompt Engineering Principles and 17-Section Master Structure. Converts raw topics, domain goals, tech stacks, and constraints into production-ready, copy-ready Ultimate Master Prompts for ChatGPT, Claude, Gemini, or local models. Features one-click domain presets, section toggles, live markdown rendering, copy-to-clipboard, export to `.md` / `.txt`, and optional local Ollama integration.

### Prerequisites
* **Python**: v3.9+
* **Ollama** (optional): running locally with `llama3.2` (`ollama serve`)

### Execution Steps
```bash
# 1. Navigate to Ultimate Prompt Generator directory
cd Individual-Projects/Ultimate-Prompt-Generator

# 2. Launch using startup script (handles virtual environment automatically)
chmod +x start.sh
./start.sh

# Or start directly with Python:
.venv/bin/python app.py
```
* **Access URL**: `http://localhost:5056` (change with `PORT=xxxx`)

---

## 📌 Project 7: Test Plan & Test Case AI Agent (`Project7-TestPlan_AIAgent_JIRA`)

### Overview
A B.L.A.S.T.-architected QA automation web application with an interactive React frontend that connects to JIRA via API tokens configured directly in the UI. Ingests JIRA project requirements, Epics, Stories, and Bugs by Ticket ID (e.g. `PROJ-101`), parses Atlassian Document Format (ADF) descriptions and Acceptance Criteria, and supports **uploading supplemental requirement documents (Microsoft Word DOCX, PDF, Markdown, TXT, JSON, YAML)**. Follows a **Two-Stage Human-in-the-Loop Workflow**: Stage 1 generates the strategic Test Plan only for review and approval; once approved, Stage 2 unlocks to generate detailed, deterministic step-by-step Test Cases using selected LLMs (Anthropic Claude 3.7 / 3.5 Sonnet, Claude 3 Opus, Claude 3.5 Haiku, local offline Ollama models, or Gemini) at temperature 0.2. Features live UI test suite filtering, multi-format exports (two-sheet Excel `.xlsx`, RFC 4180 `.csv`, Markdown `.md`, Google Docs export, `.json`), and optional JIRA issue write-back.

### Prerequisites
* **Node.js**: v18.0+
* **JIRA Account**: Base URL, email, and Atlassian API Token
* **LLM Options**:
  * **Anthropic Claude**: API Key from Anthropic Console (`console.anthropic.com`) configured in the UI or `.env`
  * **Ollama (Optional for local offline use)**: Running locally (`ollama serve`) with any model (e.g. `llama3.2`, `codellama`)
  * **Google Gemini (Optional)**: `GEMINI_API_KEY` in `.env`

### Execution Steps
```bash
# 1. Navigate to Project 7 directory
cd Project7-TestPlan_AIAgent_JIRA

# 2. Launch using one-click startup script (handles build & dependencies automatically)
chmod +x start.sh
./start.sh

# Or start directly with npm:
npm start

# For development mode with client hot reload:
npm run dev
```
* **Access URL**: `http://localhost:5080` (or `http://localhost:5174` in Vite dev mode)

---

## 📌 Project: Mindset Builder Agent (`Individual-Projects/Mindset-Builder-Agent`)

### Overview
A B.L.A.S.T.-architected cognitive coaching web application and conversational agent designed to instill the deep mental models, intuition, and aptitude of ANY field or subject (e.g. QA Engineering, DevOps & SRE, Product Management, Cybersecurity, AI Prompt Engineering, Healthcare, etc.). Built on the premise that while mechanical skills are increasingly automated by AI, mindset drives over 70% of elite performance. Features a Gemini/ChatGPT-inspired web portal with an interactive HTML5 canvas rendering flowing neural network nodes and action potentials, industry certification syllabus deconstruction (e.g. ISTQB, DORA, CISSP), a Tri-Tier Analogy Engine (Easy, Medium, and Hard/Philosophical analogies with 1-to-1 cognitive mapping), a 5-chapter interactive curriculum with real-world scenario drills, continuous Socratic mentoring, and one-click Markdown Mindset Dossier export.

### Prerequisites
* **Python**: v3.9+
* **Dependencies**: Flask, Requests (included in `.venv`)
* **LLM Options**:
  * **Built-in Deterministic Engine**: 100% offline ready with pre-compiled cognitive models for major disciplines and algorithmic synthesis for arbitrary fields.
  * **Google Gemini (Optional)**: Set `GEMINI_API_KEY` in `.env`.
  * **Ollama (Optional for local offline inference)**: Set `OLLAMA_HOST` in `.env` (`http://localhost:11434`).

### Execution Steps
```bash
# 1. Navigate to Mindset Builder Agent directory
cd Individual-Projects/Mindset-Builder-Agent

# 2. Launch using one-click startup script (handles virtual environment automatically)
chmod +x start.sh
./start.sh

# Or start directly with Python:
.venv/bin/python app.py
```
* **Access URL**: `http://localhost:5095` (change with `PORT=xxxx`)

---

## ⚙️ Maintainer Instructions for AI & Contributors

> [!IMPORTANT]
> Whenever a new project or module is added to `MyAITesterBlueprint`:
> 1. Update this `EXECUTION_STEPS.md` file with the project title, prerequisites, directory path, and exact shell execution commands.
> 2. Ensure all commands are verified and runnable from the repository root or project directory.
