import { test, expect } from '../fixtures';
import { LoginPage } from '../pages';

test.describe('Login Page', () => {
  test.describe('when not authenticated', () => {
    test('should display the login page', async ({ loginPage }) => {
      await loginPage.expectPageToBeVisible();
      await loginPage.expectLoginButtonToBeVisible();
    });

    test('should display the login button with correct text', async ({
      loginPage,
    }) => {
      await expect(loginPage.loginButton).toHaveText('Login With Google');
    });
  });

  test.describe('login flow', () => {
    test('should login successfully via Google OAuth emulator popup', async ({
      loginPage,
      login,
      testUser,
      page,
    }) => {
      // Perform login via emulator popup
      await login(page, testUser);

      // Should now show the logout page
      await loginPage.expectLogoutButtonToBeVisible();
      await loginPage.expectUserLoggedInWithEmail(testUser.email);
    });
  });

  test.describe('logout flow', () => {
    test('should show login button after logout', async ({
      authenticatedPage,
    }) => {
      const loginPage = new LoginPage(authenticatedPage);

      await loginPage.clickLogout();

      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.loginButton).toHaveText('Login With Google');
    });
  });
});
