import { test as base, type Page } from '@playwright/test';
import {
  type TestUser,
  createTestUserData,
  signInWithGoogleEmulatorPopup,
} from '../helpers';

type AuthFixtures = {
  testUser: TestUser;
  authenticatedPage: Page;
  login: (page: Page, testUser?: TestUser) => Promise<void>;
};

/**
 * Extended test with authentication fixtures for Google OAuth
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Provides test user data that can be used for authentication tests
   */
  testUser: async ({ page: _page }, use) => {
    const testUser = createTestUserData();
    await use(testUser);
  },

  /**
   * Provides a login function that handles the Firebase Auth emulator popup
   */
  login: async ({ page: _page }, use) => {
    const loginFn = async (page: Page, testUser?: TestUser) => {
      const user = testUser ?? createTestUserData();

      await signInWithGoogleEmulatorPopup(page, user, async () => {
        await page.getByTestId('login-button').click();
      });
    };

    await use(loginFn);
  },

  /**
   * Provides a page that is pre-authenticated with a Google OAuth test user
   */
  authenticatedPage: async ({ page, testUser, login }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Use the login function to authenticate via the emulator popup
    await login(page, testUser);

    // Wait for authentication to complete (logout button should be visible)
    await page.waitForSelector('[data-testid="logout-page"]');

    await use(page);
  },
});

export { expect } from '@playwright/test';
