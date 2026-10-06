import { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
  }

  async fillUsername(username: string) {
    await this.username.fill(username);
  }

  async fillPassword(password: string) {
    await this.password.fill(password);
  }

  async clickLoginButton() {
    await this.page.click('[data-test="login-button"]');
  }
}
