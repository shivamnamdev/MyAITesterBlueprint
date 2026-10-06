import { expect, test } from '@playwright/test';

import { DriverManagerTL } from 'com.thetestingacademy.driver';

class CommonToAllTest {
  private readonly page: Page;
  private readonly driverManager: DriverManagerTL;

  constructor() {
    this.page = page;
    this.driverManager = new DriverManagerTL();
  }

  async setUp() {
    await this.driverManager.init();
  }

  async tearDown() {
    await this.driverManager.down();
  }
}

test('name', async ({ page }) => {
  const commonToAllTest = new CommonToAllTest();
  await commonToAllTest.setUp();
  // Test code here
  await commonToAllTest.tearDown();
});
