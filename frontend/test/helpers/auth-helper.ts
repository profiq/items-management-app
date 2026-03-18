import type { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

export type TestUser = {
  email: string;
  displayName: string;
};

/**
 * Creates test user data for Google OAuth sign-in
 */
export function createTestUserData(): TestUser {
  return {
    email: faker.internet.email({ provider: 'profiq.com' }).toLowerCase(),
    displayName: faker.person.fullName(),
  };
}

/**
 * Handles the Firebase Auth emulator popup for Google sign-in.
 * This interacts with the emulator's "Add new account" UI that appears
 * when signInWithPopup is called with the emulator.
 *
 * @param page - The main Playwright page
 * @param testUser - The test user data to fill in the popup
 * @param triggerPopup - A function that triggers the popup (e.g., clicking login button)
 */
export async function signInWithGoogleEmulatorPopup(
  page: Page,
  testUser: TestUser,
  triggerPopup: () => Promise<void>
): Promise<void> {
  // Listen for the popup before triggering it
  const popupPromise = page.waitForEvent('popup');

  // Trigger the popup (e.g., click the login button)
  await triggerPopup();

  // Wait for the popup to open
  const popup = await popupPromise;
  await popup.waitForLoadState();

  // The Firebase Auth emulator shows a UI to add a new account
  // Click "Add new account" button to create a new test user
  await popup.click('text=Add new account');

  // Fill in the test user details in the emulator form
  // The emulator has input fields for email, display name, etc.
  await popup.fill('input[id="email-input"]', testUser.email);
  await popup.fill('input[id="display-name-input"]', testUser.displayName);

  // Click the "Sign in" button to complete authentication
  await popup.click('text=Sign in with Google.com');

  // Wait for the popup to close (authentication complete)
  await popup.waitForEvent('close');
}
