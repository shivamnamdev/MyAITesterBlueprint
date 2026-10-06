import { Locator, Page, test } from '@playwright/test';

export class CommonToAllPage {
  readonly page: Page;
  readonly implicitWait: Locator;
  readonly clickElement: Locator;
  readonly presenceOfElement: Locator;
  readonly visibilityOfElement: Locator;
  readonly enterInput: Locator;
  readonly getElement: Locator;
  readonly iWaitForElementToBeVisible: Locator;

  constructor(page: Page) {
    this.page = page;
    this.implicitWait = page.locator('[data-testid="implicit-wait"]');
    this.clickElement = page.locator('[data-testid="click-element"]');
    this.presenceOfElement = page.locator('[data-testid="presence-of-element"]');
    this.visibilityOfElement = page.locator('[data-testid="visibility-of-element"]');
    this.enterInput = page.locator('[data-testid="enter-input"]');
    this.getElement = page.locator('[data-testid="get-element"]');
    this.iWaitForElementToBeVisible = page.locator('[data-testid="i-wait-for-element-to-be-visible"]');
  }

  async implicitWait() {
    await this.implicitWait.fill('10');
  }

  async clickElement(by: By) {
    await this.clickElement.click();
  }

  async presenceOfElement(elementLocation: By) {
    return await this.presenceOfElement.fill(elementLocation);
  }

  async visibilityOfElement(elementLocation: By) {
    return await this.visibilityOfElement.fill(elementLocation);
  }

  async enterInput(by: By, key: string) {
    await this.enterInput.fill(key);
  }

  async getElement(key: By) {
    return await this.getElement.fill(key);
  }

  async iWaitForElementToBeVisible(loc: Locator, url: string) {
    try {
      await this.iWaitForElementToBeVisible.fill(loc);
      await this.iWaitForElementToBeVisible.fill(url);
    } catch (e) {
      console.log('Failed to Wait!: ' + e.toString());
    }
  }
}

test('name', async ({ page }) => {
  const commonToAllPage = new CommonToAllPage(page);
  await commonToAllPage.implicitWait();
  await commonToAllPage.clickElement(By.css('[data-testid="click-element"]'));
  await commonToAllPage.presenceOfElement(By.css('[data-testid="presence-of-element"]'));
  await commonToAllPage.visibilityOfElement(By.css('[data-testid="visibility-of-element"]'));
  await commonToAllPage.enterInput(By.css('[data-testid="enter-input"]'), 'key');
  await commonToAllPage.getElement(By.css('[data-testid="get-element"]'));
  await commonToAllPage.iWaitForElementToBeVisible(By.css('[data-testid="i-wait-for-element-to-be-visible"]'), 'url');
});
