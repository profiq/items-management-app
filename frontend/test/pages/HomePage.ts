import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Home page
 */
export class HomePage extends BasePage {
  readonly pageUrl = '/';
  readonly pageTestId = 'home-page';

  // Locators
  get title() {
    return this.getByTestId('home-title');
  }
  get card() {
    return this.getByTestId('home-card');
  }
  get welcomeMessage() {
    return this.getByTestId('home-welcome-message');
  }
  get statusMessage() {
    return this.getByTestId('home-status-message');
  }

  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the welcome message text
   */
  async getWelcomeMessageText(): Promise<string> {
    return (await this.welcomeMessage.textContent()) ?? '';
  }

  /**
   * Get the status message text
   */
  async getStatusMessageText(): Promise<string> {
    return (await this.statusMessage.textContent()) ?? '';
  }

  /**
   * Assert that the title is visible and has correct text
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.title).toHaveText('Reference website for Profiq.com');
  }

  /**
   * Assert that the welcome message is visible
   */
  async expectWelcomeMessageToBeVisible(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.welcomeMessage).toContainText(
      'Welcome to the reference website of Profiq SP'
    );
  }

  /**
   * Assert that the card is visible
   */
  async expectCardToBeVisible(): Promise<void> {
    await expect(this.card).toBeVisible();
  }

  /**
   * Assert that the status message is visible
   */
  async expectStatusMessageToBeVisible(): Promise<void> {
    await expect(this.statusMessage).toBeVisible();
    await expect(this.statusMessage).toContainText(
      'As of this moment it is out of order'
    );
  }
}
