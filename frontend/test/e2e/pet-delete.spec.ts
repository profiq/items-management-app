import { test, expect } from '../fixtures';
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
      petDeletePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petDeletePage.navigateToDeletePet(petId);

      await petDeletePage.expectPageToBeVisible();
    });

    test('should display the title with pet name', async ({
      petDeletePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petDeletePage.navigateToDeletePet(petId);
      await petDeletePage.waitForDeletePageToLoad();

      await petDeletePage.expectTitleToBeVisible();
      const titleText = await petDeletePage.getTitleText();
      expect(titleText).toContain('Delete Pet');
    });

    test('should display confirmation message', async ({
      petDeletePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petDeletePage.navigateToDeletePet(petId);
      await petDeletePage.waitForDeletePageToLoad();

      await petDeletePage.expectConfirmationMessageToBeVisible();
      const confirmText = await petDeletePage.getConfirmationMessageText();
      expect(confirmText).toContain(
        'Are you sure you want to delete this pet?'
      );
    });

    test('should display confirm delete button', async ({
      petDeletePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petDeletePage.navigateToDeletePet(petId);
      await petDeletePage.waitForDeletePageToLoad();

      await petDeletePage.expectConfirmDeleteButtonToBeVisible();
    });

    test('should have correct URL', async ({
      petDeletePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petDeletePage.navigateToDeletePet(petId);

      const url = await petDeletePage.getCurrentUrl();
      expect(url).toContain(`/pets/${petId}/delete`);
    });
  });
});
