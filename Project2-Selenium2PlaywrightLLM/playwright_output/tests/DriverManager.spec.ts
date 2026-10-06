import { Page, expect, test } from '@playwright/test';

class DriverManager {
  private static driver: Page;

  static async init() {
    if (!this.driver) {
      this.driver = await new Page();
    }
  }

  static async down() {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }
}

test('name', async ({ page }) => {
  await DriverManager.init();
  // Test code here
  await DriverManager.down();
});
