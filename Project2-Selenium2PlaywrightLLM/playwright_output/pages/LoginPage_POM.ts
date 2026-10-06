import { Page, expect, test } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly signButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('#login-username');
    this.password = page.locator('#login-password');
    this.signButton = page.locator('#js-login-btn');
    this.errorMessage = page.locator('#js-notification-box-msg');
  }

  async loginToVWOPositive() {
    await this.username.fill(PropertyReader.readKey('username'));
    await this.password.fill(PropertyReader.readKey('password'));
    await this.signButton.click();
    // Pass the control to the DashboardPage
    return this;
  }

  async openURL(url: string) {
    await this.page.goto(url);
  }

  async loginToVWONegative() {
    await this.username.fill('admin');
    await this.password.fill(PropertyReader.readKey('password'));
    await this.signButton.click();
    // error String
    await this.errorMessage.waitFor();
    return this.errorMessage.textContent();
  }

  async afterLogin() {
    return new DashboardPage();
  }
}

test('loginToVWOPositive', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.openURL('https://www.example.com');
  await loginPage.loginToVWOPositive();
  // Assertions
  expect(page.url()).toBe('https://www.example.com/dashboard');
});

test('loginToVWONegative', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.openURL('https://www.example.com');
  const errorMessage = await loginPage.loginToVWONegative();
  // Assertions
  expect(errorMessage).toBe('Invalid credentials');
});
