import { Locator, Page } from '@playwright/test';

export class DashboardPage_POM {
  readonly page: Page;
  readonly userNameOnDashboard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameOnDashboard = page.locator('[data-qa="lufexuloga"]');
  }

  async loggedInUserName(): Promise<string> {
    await this.userNameOnDashboard.waitFor();
    return await this.userNameOnDashboard.textContent();
  }
}
