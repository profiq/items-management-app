import { test, expect } from '../fixtures';

test.describe('Profile Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing profile page', async ({
      page,
    }) => {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the profile page', async ({ profilePage }) => {
      await profilePage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ profilePage }) => {
      await profilePage.expectTitleToBeVisible();
      const titleText = await profilePage.getTitleText();
      expect(titleText).toContain('Profile');
    });

    test('should display user info section', async ({ profilePage }) => {
      await profilePage.expectUserInfoToBeVisible();
    });

    test('should display user email', async ({ profilePage, testUser }) => {
      await profilePage.expectUserEmailToContain(testUser.email);
    });

    test('should display user name', async ({ profilePage, testUser }) => {
      await profilePage.expectUserNameToContain(testUser.displayName);
    });

    test('should have correct URL', async ({ profilePage }) => {
      const url = await profilePage.getCurrentUrl();
      expect(url).toContain('/profile');
    });
  });
});
