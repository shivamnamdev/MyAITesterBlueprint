# 📜 Project Constitution: Selenium Java to Playwright TS Converter (Ollama LLM)

## 1. Project Map & Core Identity
- **Goal:** Convert Selenium Java test scripts and Page Object Models to Playwright TypeScript (`@playwright/test`) test files using a local Ollama API engine + deterministic tools.
- **Protocol Standard:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)

## 2. Architectural Invariants
- Code conversion & helper scripts must reside in `tools/`.
- Technical SOPs must be maintained in `architecture/`.
- Intermediate conversion artifacts, AST structures, and prompt files must be stored in `.tmp/`.
- The conversion engine must support local Ollama endpoint (`http://localhost:11434/api/generate` or `/api/chat`).
- Output files must be valid TypeScript adhering to `@playwright/test` conventions.

## 3. Data Schemas (Input / Output Shapes)

### Input Payload Schema (`ConversionRequest`)
```json
{
  "sourcePath": "string (path to file or directory)",
  "sourceType": "file | directory",
  "targetDir": "string (output directory path)",
  "ollamaHost": "string (default: http://localhost:11434)",
  "ollamaModel": "string (default: codellama)",
  "options": {
    "preservePom": true,
    "targetLanguage": "typescript",
    "testRunner": "@playwright/test",
    "locatorStrategy": "smart"
  }
}
```

### Output Payload Schema (`ConversionResult`)
```json
{
  "status": "success | failure | partial",
  "filesConverted": [
    {
      "javaSourceFile": "string",
      "targetFile": "string",
      "fileType": "spec | page_object | helper",
      "status": "converted | error",
      "error": "string | null"
    }
  ],
  "summary": {
    "totalFiles": 0,
    "successful": 0,
    "failed": 0
  }
}
```

## 4. Behavioral Rules
- Retain original Java test assertions and convert them to idiomatic Playwright matchers (e.g., `Assert.assertEquals(a, b)` -> `expect(a).toEqual(b)`).
- Map Selenium locators (`By.id`, `By.xpath`, `By.cssSelector`) to Playwright locators (`page.locator()`, `page.getByRole()`, `page.getByTestId()`).
- Convert JUnit/TestNG annotations (`@Test`, `@BeforeMethod`, `@AfterMethod`) to Playwright test lifecycle blocks (`test()`, `test.beforeEach()`, `test.afterEach()`).
- Maintain Page Object Model class definitions in TypeScript classes.

## 5. Maintenance & Error Log
- **2026-10-05:** Successfully initialized protocol 0 and completed Phase 1 Blueprint.
- **2026-10-05:** Phase 2 Link verification passed for local Ollama host (`http://localhost:11434`) and model `codellama:latest`.
- **2026-10-05:** Phase 3 Architect complete: Created `architecture/sop_selenium_mapping.md` and `architecture/sop_conversion_pipeline.md`. Implemented `tools/java_parser.py`, `tools/ollama_client.py`, and `tools/converter_cli.py`.
- **2026-10-05:** Phase 4 & 5 Complete: Executed conversion on `ATB4xSeleniumAdvanceFramework` generating Playwright TypeScript output files in `playwright_output/`.
