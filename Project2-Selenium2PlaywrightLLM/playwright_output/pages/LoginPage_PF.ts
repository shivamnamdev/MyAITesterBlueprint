import { Locator, Page } from '@playwright/test';

export class LoginPage_PF {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('[name="username"]');
    this.password = page.locator('[name="password"]');
  }

  async fillUsername(username: string) {
    await this.username.fill(username);
  }

  async fillPassword(password: string) {
    await this.password.fill(password);
  }

  async clickLoginButton() {
    await this.page.click('[type="submit"]');
  }
}
