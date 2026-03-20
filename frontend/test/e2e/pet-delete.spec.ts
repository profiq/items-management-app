import { test, expect } from '../fixtures';
import { PetDeletePage } from '../pages';
import { getFirstPetId } from '../helpers';

test.describe('Pet Delete Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing delete pet page', async ({
      page,
    }) => {
      await page.goto('/pets/1/delete');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the delete pet page', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const deletePage = new PetDeletePage(authenticatedPage);
      await deletePage.navigateToDeletePet(petId);

      await deletePage.expectPageToBeVisible();
    });

    test('should display the title with pet name', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const deletePage = new PetDeletePage(authenticatedPage);
      await deletePage.navigateToDeletePet(petId);
      await deletePage.waitForDeletePageToLoad();

      await deletePage.expectTitleToBeVisible();
      const titleText = await deletePage.getTitleText();
      expect(titleText).toContain('Delete Pet');
    });

    test('should display confirmation message', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const deletePage = new PetDeletePage(authenticatedPage);
      await deletePage.navigateToDeletePet(petId);
      await deletePage.waitForDeletePageToLoad();

      await deletePage.expectConfirmationMessageToBeVisible();
      const confirmText = await deletePage.getConfirmationMessageText();
      expect(confirmText).toContain(
        'Are you sure you want to delete this pet?'
      );
    });

    test('should display confirm delete button', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const deletePage = new PetDeletePage(authenticatedPage);
      await deletePage.navigateToDeletePet(petId);
      await deletePage.waitForDeletePageToLoad();

      await deletePage.expectConfirmDeleteButtonToBeVisible();
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const deletePage = new PetDeletePage(authenticatedPage);
      await deletePage.navigateToDeletePet(petId);

      const url = await deletePage.getCurrentUrl();
      expect(url).toContain(`/pets/${petId}/delete`);
    });
  });
});
