import { Page, expect, test } from '@playwright/test';

export class PropertyReader {
  private readonly page: Page;
  private readonly file: Locator;

  constructor(page: Page) {
    this.page = page;
    this.file = page.locator('[data-testid="data.properties"]');
  }

  async readKey(key: string): Promise<string> {
    await this.file.click();
    await this.file.fill(key);
    const value = await this.file.getProperty(key);
    if (value === null) {
      throw new Error(`${key} not found!!`);
    }
    return value;
  }
}

test('readKey', async ({ page }) => {
  const propertyReader = new PropertyReader(page);
  const key = 'key';
  const value = await propertyReader.readKey(key);
  expect(value).toBe(key);
});
