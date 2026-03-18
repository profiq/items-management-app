import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Login page
 */
export class LoginPage extends BasePage {
  readonly pageUrl = '/login';
  readonly pageTestId = 'login-page';

  // Login page locators
  get loginButton(): Locator {
    return this.getByTestId('login-button');
  }

  get errorMessage(): Locator {
    return this.getByTestId('login-error');
  }

  get loadingIndicator(): Locator {
    return this.getByTestId('login-loading');
  }

  // Logout page locators (shown when user is logged in)
  get logoutPageContainer(): Locator {
    return this.getByTestId('logout-page');
  }

  get loggedInUser(): Locator {
    return this.getByTestId('logged-in-user');
  }

  get logoutButton(): Locator {
    return this.getByTestId('logout-button');
  }

  /**
   * Wait for the page to be fully loaded (either login or logout page)
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for either login page or logout page to be visible
    await Promise.race([
      this.page.waitForSelector(`[data-testid="${this.pageTestId}"]`),
      this.page.waitForSelector('[data-testid="logout-page"]'),
    ]);
  }

  /**
   * Check if user is logged in (logout page is visible)
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.logoutPageContainer.isVisible();
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Click the logout button
   */
  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
  }

  /**
   * Get the error message text
   */
  async getErrorText(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  /**
   * Get the logged in user text
   */
  async getLoggedInUserText(): Promise<string> {
    return (await this.loggedInUser.textContent()) ?? '';
  }

  /**
   * Assert that login button is visible
   */
  async expectLoginButtonToBeVisible(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Assert that logout button is visible (user is logged in)
   */
  async expectLogoutButtonToBeVisible(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * Assert that user is logged in with specific email
   */
  async expectUserLoggedInWithEmail(email: string): Promise<void> {
    await expect(this.loggedInUser).toContainText(email);
  }
}
