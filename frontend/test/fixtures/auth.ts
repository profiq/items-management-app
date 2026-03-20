import { test as base, type Page } from '@playwright/test';
import {
  type TestUser,
  createTestUserData,
  signInWithGoogleEmulatorPopup,
} from '../helpers';
import {
  LoginPage,
  ProfilePage,
  EmployeesPage,
  PetListPage,
  PetCreatePage,
  PetDetailPage,
  PetUpdatePage,
  PetDeletePage,
} from '../pages';

type AuthFixtures = {
  testUser: TestUser;
  authenticatedPage: Page;
  login: (page: Page, testUser?: TestUser) => Promise<void>;
  loginPage: LoginPage;
  profilePage: ProfilePage;
  employeesPage: EmployeesPage;
  petListPage: PetListPage;
  petCreatePage: PetCreatePage;
  petDetailPage: PetDetailPage;
  petUpdatePage: PetUpdatePage;
  petDeletePage: PetDeletePage;
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

  /**
   * Provides a LoginPage instance that navigates to the login page
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  /**
   * Provides a ProfilePage instance that navigates to the profile page (requires authentication)
   */
  profilePage: async ({ authenticatedPage }, use) => {
    const profilePage = new ProfilePage(authenticatedPage);
    await profilePage.navigate();
    await use(profilePage);
  },

  /**
   * Provides an EmployeesPage instance that navigates to the employees page (requires authentication)
   */
  employeesPage: async ({ authenticatedPage }, use) => {
    const employeesPage = new EmployeesPage(authenticatedPage);
    await employeesPage.navigate();
    await use(employeesPage);
  },

  /**
   * Provides a PetListPage instance that navigates to the pet list page (requires authentication)
   */
  petListPage: async ({ authenticatedPage }, use) => {
    const petListPage = new PetListPage(authenticatedPage);
    await petListPage.navigate();
    await use(petListPage);
  },

  /**
   * Provides a PetCreatePage instance that navigates to the create pet page (requires authentication)
   */
  petCreatePage: async ({ authenticatedPage }, use) => {
    const petCreatePage = new PetCreatePage(authenticatedPage);
    await petCreatePage.navigate();
    await use(petCreatePage);
  },

  /**
   * Provides a PetDetailPage instance (requires authentication, does not auto-navigate)
   * Use petDetailPage.navigateToPet(id) to navigate to a specific pet
   */
  petDetailPage: async ({ authenticatedPage }, use) => {
    const petDetailPage = new PetDetailPage(authenticatedPage);
    await use(petDetailPage);
  },

  /**
   * Provides a PetUpdatePage instance (requires authentication, does not auto-navigate)
   * Use petUpdatePage.navigateToUpdatePet(id) to navigate to a specific pet's update page
   */
  petUpdatePage: async ({ authenticatedPage }, use) => {
    const petUpdatePage = new PetUpdatePage(authenticatedPage);
    await use(petUpdatePage);
  },

  /**
   * Provides a PetDeletePage instance (requires authentication, does not auto-navigate)
   * Use petDeletePage.navigateToDeletePet(id) to navigate to a specific pet's delete page
   */
  petDeletePage: async ({ authenticatedPage }, use) => {
    const petDeletePage = new PetDeletePage(authenticatedPage);
    await use(petDeletePage);
  },
});

export { expect } from '@playwright/test';
