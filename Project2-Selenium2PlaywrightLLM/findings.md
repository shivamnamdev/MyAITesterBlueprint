# Project Findings & Research

## Project Overview
- **Objective:** Convert Selenium Java test scripts to Playwright TypeScript (`@playwright/test`) scripts.

## Discovery Answers (Phase 1)
- **Target Stack:** Playwright with TypeScript (`@playwright/test`).
- **Engine:** Local LLM via Ollama API (`codellama` model at `http://localhost:11434`) + Python structural parsing tools.
- **Supported Test Frameworks:** TestNG, JUnit 4, and JUnit 5 (Jupiter).
- **Locator Strategy:** Smart conversion (Direct CSS/XPath to `page.locator(...)`, while inferring `page.getByRole(...)`, `page.getByLabel(...)`, `page.getByTestId(...)` where applicable).
- **Input Scope:** CLI tool accepting either a single Java test file or an entire project folder (handling Page Objects, test cases, and helpers).
- **Delivery Payload:** Generated `.spec.ts` files and page object `.ts` files outputted to designated target directory structure.

## Architectural & Syntax Mapping Research
- **Auto-Waiting vs Explicit Waits:** Remove redundant Selenium `WebDriverWait` / `ExpectedConditions` loops in favor of Playwright native auto-waiting actions (`await locator.click()`, `await locator.fill()`).
- **Locators Mapping:**
  - `driver.findElement(By.id("foo"))` -> `page.locator("#foo")`
  - `driver.findElement(By.xpath("..."))` -> `page.locator("xpath=...")`
  - `driver.findElement(By.cssSelector("..."))` -> `page.locator("...")`
- **Assertions Mapping:**
  - `Assert.assertEquals(act, exp)` -> `expect(act).toEqual(exp)`
  - `Assert.assertTrue(elem.isDisplayed())` -> `await expect(page.locator(...)).toBeVisible()`
- **Test Lifecycle:**
  - `@Test` -> `test('test name', async ({ page }) => { ... })`
  - `@BeforeMethod` / `@BeforeClass` -> `test.beforeEach` / `test.beforeAll`


