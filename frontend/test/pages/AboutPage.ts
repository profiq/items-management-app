import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the About page
 */
export class AboutPage extends BasePage {
  readonly pageUrl = '/about';
  readonly pageTestId = 'about-page';

  // Locators
  get title() {
    return this.getByTestId('about-title');
  }
  get description() {
    return this.getByTestId('about-description');
  }
  get techInfo() {
    return this.getByTestId('about-tech-info');
  }
  get reactLogo() {
    return this.getByTestId('about-react-logo');
  }

  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the description text
   */
  async getDescriptionText(): Promise<string> {
    return (await this.description.textContent()) ?? '';
  }

  /**
   * Get the tech info text
   */
  async getTechInfoText(): Promise<string> {
    return (await this.techInfo.textContent()) ?? '';
  }

  /**
   * Assert that the title is visible and has correct text
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.title).toHaveText('Reference website');
  }

  /**
   * Assert that the description is visible
   */
  async expectDescriptionToBeVisible(): Promise<void> {
    await expect(this.description).toBeVisible();
    await expect(this.description).toContainText('This is a reference website');
  }

  /**
   * Assert that the tech info section is visible
   */
  async expectTechInfoToBeVisible(): Promise<void> {
    await expect(this.techInfo).toBeVisible();
    await expect(this.techInfo).toContainText('This website is made using');
  }

  /**
   * Assert that the React logo is visible
   */
  async expectReactLogoToBeVisible(): Promise<void> {
    await expect(this.reactLogo).toBeVisible();
  }
}
