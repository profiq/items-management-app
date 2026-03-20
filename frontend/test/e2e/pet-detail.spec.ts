import { test, expect } from '../fixtures';
import { PetDetailPage } from '../pages';
import { getFirstPetId } from '../helpers';

test.describe('Pet Detail Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing pet detail page', async ({
      page,
    }) => {
      // Attempt to navigate to a pet detail page without authentication
      await page.goto('/pets/1');

      // Should redirect to login page since pets is protected
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the pet detail page', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);

      await petDetailPage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);

      await petDetailPage.expectTitleToBeVisible();
      const titleText = await petDetailPage.getTitleText();
      expect(titleText).toContain('Details of a Pet');
    });

    test('should display pet details', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);
      await petDetailPage.waitForPetToLoad();

      await petDetailPage.expectDetailToBeVisible();
      await expect(petDetailPage.petId).toBeVisible();
      await expect(petDetailPage.petName).toBeVisible();
      await expect(petDetailPage.petSpecies).toBeVisible();
      await expect(petDetailPage.petRace).toBeVisible();
    });

    test('should display action buttons', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);
      await petDetailPage.waitForPetToLoad();

      await petDetailPage.expectCreateVisitButtonToBeVisible();
      await petDetailPage.expectUpdateButtonToBeVisible();
      await petDetailPage.expectDeleteButtonToBeVisible();
    });

    test('should navigate to update page when clicking update button', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);
      await petDetailPage.waitForPetToLoad();

      await petDetailPage.clickUpdate();

      await expect(authenticatedPage).toHaveURL(
        new RegExp(`/pets/${petId}/update`)
      );
    });

    test('should navigate to delete page when clicking delete button', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);
      await petDetailPage.waitForPetToLoad();

      await petDetailPage.clickDelete();

      await expect(authenticatedPage).toHaveURL(
        new RegExp(`/pets/${petId}/delete`)
      );
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const petDetailPage = new PetDetailPage(authenticatedPage);
      await petDetailPage.navigateToPet(petId);

      const url = await petDetailPage.getCurrentUrl();
      expect(url).toContain(`/pets/${petId}`);
    });
  });
});
