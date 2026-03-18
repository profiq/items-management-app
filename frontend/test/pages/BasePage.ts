import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Base page object class that all other page objects extend.
 * Provides common functionality for navigation, waiting, and element interaction.
 */
export abstract class BasePage {
  protected readonly page: Page;
  abstract readonly pageUrl: string;
  abstract readonly pageTestId: string;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.pageUrl);
  }

  /**
   * Wait for the page to be fully loaded by checking for the page container
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector(`[data-testid="${this.pageTestId}"]`);
  }

  /**
   * Navigate to page and wait for it to load
   */
  async navigate(): Promise<void> {
    await this.goto();
    await this.waitForPageLoad();
  }

  /**
   * Get a locator for an element by test id
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get the page container element
   */
  getPageContainer(): Locator {
    return this.getByTestId(this.pageTestId);
  }

  /**
   * Check if the page is visible/loaded
   */
  async isPageVisible(): Promise<boolean> {
    return await this.getPageContainer().isVisible();
  }

  /**
   * Assert that the page is visible
   */
  async expectPageToBeVisible(): Promise<void> {
    await expect(this.getPageContainer()).toBeVisible();
  }

  /**
   * Get the current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get the page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
