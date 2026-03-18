import { test, expect } from '../fixtures';
import { ProfilePage } from '../pages';

test.describe('Profile Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing profile page', async ({
      page,
    }) => {
      // Attempt to navigate to profile page without authentication
      await page.goto('/profile');

      // Should redirect to login page since profile is protected
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the profile page', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectTitleToBeVisible();
      const titleText = await profilePage.getTitleText();
      expect(titleText).toContain('Profile');
    });

    test('should display the subtitle', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectSubtitleToBeVisible();
      const subtitleText = await profilePage.getSubtitleText();
      expect(subtitleText).toBe('Only for profiq eyes!');
    });

    test('should display the security note', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectSecurityNoteToBeVisible();
      const securityNoteText = await profilePage.getSecurityNoteText();
      expect(securityNoteText).toContain('client-side enforced');
    });

    test('should display user info section', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectUserInfoToBeVisible();
    });

    test('should display user email', async ({
      authenticatedPage,
      testUser,
    }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectUserEmailToContain(testUser.email);
    });

    test('should display user name', async ({
      authenticatedPage,
      testUser,
    }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      await profilePage.expectUserNameToContain(testUser.displayName);
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const profilePage = new ProfilePage(authenticatedPage);
      await profilePage.navigate();

      const url = await profilePage.getCurrentUrl();
      expect(url).toContain('/profile');
    });
  });
});
