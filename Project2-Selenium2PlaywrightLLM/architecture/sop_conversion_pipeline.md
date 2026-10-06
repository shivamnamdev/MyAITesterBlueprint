# 🔄 SOP: Conversion Pipeline & Prompt Strategy

## Overview
This document defines the multi-step deterministic pipeline for converting Java Selenium source files (Page Objects, Tests, Utilities) into Playwright TypeScript files using structural parsing and the local Ollama LLM (`codellama:latest`).

---

## Pipeline Architecture

```
[ Input Java File / Project Folder ]
                │
                ▼
      ┌──────────────────┐
      │  java_parser.py  │  <-- Step 1: Structural Analysis & AST/Regex Scanning
      └────────┬─────────┘
               │ (Extracted Metadata: class type, locators, methods, assertions)
               ▼
      ┌──────────────────┐
      │ ollama_client.py │  <-- Step 2: Context-Aware LLM Translation
      └────────┬─────────┘
               │ (Raw Converted TypeScript)
               ▼
      ┌──────────────────┐
      │ Post-Processing  │  <-- Step 3: Clean imports, formatting & TS validation
      └────────┬─────────┘
               │
               ▼
  [ Playwright TS (.spec.ts / .ts) ]
```

---

## Step 1: Structural Parsing (`tools/java_parser.py`)
- Detect file role:
  - `page_object`: Contains `By` locators, page actions, extends `CommonToAllPage` or similar.
  - `test_class`: Contains `@Test`, `@BeforeMethod`, assertions (`Assert`, `Assertions`).
  - `utility`: Contains config readers (`PropertyReader`, `JSONReader`), constants.
- Extract:
  - Package name and imports.
  - Class name and superclass.
  - Field declarations (`By`, constants, dependencies).
  - Method signatures, parameters, and bodies.

---

## Step 2: Context-Aware Prompt Construction (`tools/ollama_client.py`)
- Supply the LLM with:
  1. System Prompt enforcing `sop_selenium_mapping.md` rules.
  2. Structural metadata from `java_parser.py`.
  3. Raw Java source code.
- Request output strictly wrapped in standard TypeScript blocks.

---

## Step 3: Post-Processing & Validation
- Strip Markdown code block wrappers (` ```typescript ... ``` `).
- Verify TS imports (e.g. `import { test, expect, Page, Locator } from '@playwright/test';`).
- Save output file to target output folder:
  - Page objects -> `pages/<ClassName>.ts`
  - Tests -> `tests/<TestName>.spec.ts`
