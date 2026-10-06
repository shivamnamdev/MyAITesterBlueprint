import { Page, expect, test } from '@playwright/test';

export class DriverManagerTL {
  private static readonly dr = new ThreadLocal<WebDriver>();

  public static setDriver(driverRef: WebDriver) {
    this.dr.set(driverRef);
  }

  public static getDriver(): WebDriver {
    return this.dr.get();
  }

  // Unload
  public static unload() {
    this.dr.remove();
  }

  public static down() {
    if (this.getDriver()) {
      this.getDriver().quit();
      this.unload();
    }
  }

  public static async init() {
    if (!this.getDriver()) {
      const options = new EdgeOptions();
      options.addArguments('--guest');
      options.addArguments('--remote-allow-origins=*');
      const driver = new EdgeDriver(options);
      this.setDriver(driver);
    }
  }
}
