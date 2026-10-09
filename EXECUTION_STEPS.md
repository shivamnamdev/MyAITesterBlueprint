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

## ⚙️ Maintainer Instructions for AI & Contributors

> [!IMPORTANT]
> Whenever a new project or module is added to `MyAITesterBlueprint`:
> 1. Update this `EXECUTION_STEPS.md` file with the project title, prerequisites, directory path, and exact shell execution commands.
> 2. Ensure all commands are verified and runnable from the repository root or project directory.
