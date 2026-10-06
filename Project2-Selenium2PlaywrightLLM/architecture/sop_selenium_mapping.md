# 📐 SOP: Selenium Java to Playwright TypeScript Mapping Rules

## Overview
This document specifies the deterministic translation rules between Selenium Java constructs and Playwright TypeScript constructs.

---

## 1. Locators Mapping (`By` -> Playwright Locator)

| Selenium Java (`By`) | Playwright TS Equivalent | Note / Strategy |
| :--- | :--- | :--- |
| `By.id("login-username")` | `page.locator('#login-username')` | Smart mapping converts ID to `#id` |
| `By.cssSelector(".btn-primary")` | `page.locator('.btn-primary')` | Direct CSS selector |
| `By.xpath("//button[@id='submit']")` | `page.locator('xpath=//button[@id="submit"]')` | Explicit XPath prefix |
| `By.name("email")` | `page.locator('[name="email"]')` | Attribute selector |
| `By.linkText("Click Here")` | `page.getByRole('link', { name: 'Click Here' })` | Semantic locator preference |
| `By.partialLinkText("Click")` | `page.getByRole('link', { name: /Click/i })` | Regex name match |

---

## 2. Element Interactions & Auto-Waiting

| Selenium Java | Playwright TS Equivalent |
| :--- | :--- |
| `driver.findElement(by).click()` | `await page.locator(by).click()` |
| `driver.findElement(by).sendKeys("text")` | `await page.locator(by).fill("text")` |
| `driver.findElement(by).clear()` | `await page.locator(by).clear()` |
| `driver.findElement(by).getText()` | `await page.locator(by).textContent()` |
| `driver.findElement(by).getAttribute("val")` | `await page.locator(by).getAttribute("val")` |
| `driver.get("url")` / `driver.navigate().to("url")` | `await page.goto("url")` |
| `WebDriverWait` / `ExpectedConditions` | *Remove redundant wait loops; leverage Playwright auto-waiting.* |

---

## 3. Test Lifecycle & Annotations

| Java (TestNG / JUnit) | Playwright TS (`@playwright/test`) |
| :--- | :--- |
| `@Test` | `test('test method name', async ({ page }) => { ... })` |
| `@BeforeMethod` / `@BeforeEach` | `test.beforeEach(async ({ page }) => { ... })` |
| `@AfterMethod` / `@AfterEach` | `test.afterEach(async ({ page }) => { ... })` |
| `@BeforeClass` / `@BeforeAll` | `test.beforeAll(async () => { ... })` |
| `@AfterClass` / `@AfterAll` | `test.afterAll(async () => { ... })` |

---

## 4. Assertions Mapping

| Java Assertion Library | Playwright TS Assertion |
| :--- | :--- |
| `Assert.assertEquals(actual, expected)` | `expect(actual).toEqual(expected)` |
| `Assert.assertTrue(condition)` | `expect(condition).toBeTruthy()` |
| `Assertions.assertThat(actual).contains(sub)` | `expect(actual).toContain(sub)` |
| `Assertions.assertThat(actual).isNotNull().isNotBlank()` | `expect(actual).toBeTruthy()` |
| `element.isDisplayed()` assertion | `await expect(page.locator(by)).toBeVisible()` |

---

## 5. Page Object Model (POM) Structure

### Java Page Object Class:
```java
public class LoginPage_POM {
    By username = By.id("login-username");
    By password = By.id("login-password");
    By signButton = By.id("js-login-btn");

    public void loginToVWO(String user, String pass) {
        enterInput(username, user);
        enterInput(password, pass);
        clickElement(signButton);
    }
}
```

### Converted Playwright TypeScript Class:
```typescript
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#login-username');
    this.passwordInput = page.locator('#login-password');
    this.submitButton = page.locator('#js-login-btn');
  }

  async loginToVWO(user: string, pass: string): Promise<void> {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
```
