import { Locator, Page, expect, test } from '@playwright/test';

class LoginPage {
  readonly page: Page;
  readonly url: Locator;
  readonly userName: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.url = page.locator('input[name="url"]');
    this.userName = page.locator('input[name="userName"]');
    this.password = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
  }

  async openURL(url: string) {
    await this.url.fill(url);
    await this.loginButton.click();
  }

  async loginToVWONegative() {
    await this.userName.fill('invalid_user');
    await this.password.fill('invalid_password');
    await this.loginButton.click();
    const errorMessage = await this.page.locator('div[class="error-message"]').textContent();
    return errorMessage;
  }

  async loginToVWOPositive() {
    await this.userName.fill('valid_user');
    await this.password.fill('valid_password');
    await this.loginButton.click();
    const dashboardPage = await this.page.locator('div[class="dashboard-page"]').waitFor();
    const loggedInUserName = await dashboardPage.locator('div[class="logged-in-user"]').textContent();
    return loggedInUserName;
  }
}

test('testLoginPNegative', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.openURL(PropertyReader.readKey('url'));
  const errorMessage = await loginPage.loginToVWONegative();
  expect(errorMessage).toBeNotNull();
  expect(errorMessage).toBeNotBlank();
  expect(errorMessage).toContain(PropertyReader.readKey('error_message'));
});

test('testLoginPositive', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.openURL(PropertyReader.readKey('url'));
  const loggedInUserName = await loginPage.loginToVWOPositive();
  expect(loggedInUserName).toBeNotNull();
  expect(loggedInUserName).toBeNotBlank();
  expect(loggedInUserName).toContain(PropertyReader.readKey('expected_username'));
});
