import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '../fixtures';
import { PetListPage, PetUpdatePage } from '../pages';
import type { Page } from 'playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_IMAGE_PATH = path.join(__dirname, '../assets/test-image.png');

test.describe('Pet Update Page', () => {
  // Helper to get a valid pet ID from the list
  async function getFirstPetId(
    authenticatedPage: Page
  ): Promise<string | null> {
    const petListPage = new PetListPage(authenticatedPage);
    await petListPage.navigate();
    await petListPage.waitForPetsToLoad();

    const petCount = await petListPage.getPetCount();
    if (petCount === 0) {
      return null;
    }

    const firstPetLink = petListPage.getPetRows().first().locator('a').first();
    const href = await firstPetLink.getAttribute('href');
    const match = href?.match(/\/pets\/(\d+)/);
    return match ? match[1] : null;
  }

  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing update pet page', async ({
      page,
    }) => {
      await page.goto('/pets/1/update');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the update pet page', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const updatePage = new PetUpdatePage(authenticatedPage);
      await updatePage.navigateToUpdatePet(petId);

      await updatePage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const updatePage = new PetUpdatePage(authenticatedPage);
      await updatePage.navigateToUpdatePet(petId);
      await updatePage.waitForUpdatePageToLoad();

      await updatePage.expectTitleToBeVisible();
      const titleText = await updatePage.getTitleText();
      expect(titleText).toContain('Update a Pet');
    });

    test('should display the form with pre-filled values', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const updatePage = new PetUpdatePage(authenticatedPage);
      await updatePage.navigateToUpdatePet(petId);
      await updatePage.waitForUpdatePageToLoad();

      await updatePage.expectFormToBeVisible();
      // Name should be pre-filled (not empty)
      const nameValue = await updatePage.getNameValue();
      expect(nameValue.length).toBeGreaterThan(0);
    });

    test('should display submit and reset buttons', async ({
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const updatePage = new PetUpdatePage(authenticatedPage);
      await updatePage.navigateToUpdatePet(petId);
      await updatePage.waitForUpdatePageToLoad();

      await updatePage.expectSubmitButtonToBeVisible();
      await updatePage.expectResetButtonToBeVisible();
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      const updatePage = new PetUpdatePage(authenticatedPage);
      await updatePage.navigateToUpdatePet(petId);

      const url = await updatePage.getCurrentUrl();
      expect(url).toContain(`/pets/${petId}/update`);
    });

    test.describe('image upload', () => {
      test('should display dropzone for image upload', async ({
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        const updatePage = new PetUpdatePage(authenticatedPage);
        await updatePage.navigateToUpdatePet(petId);
        await updatePage.waitForUpdatePageToLoad();

        await expect(updatePage.imageDropzone).toBeVisible();
      });

      test('should upload an image file', async ({ authenticatedPage }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        const updatePage = new PetUpdatePage(authenticatedPage);
        await updatePage.navigateToUpdatePet(petId);
        await updatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await updatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify the file name is displayed
        await expect(
          updatePage.imageDropzone.locator('text=Selected:')
        ).toBeVisible();
        await expect(
          updatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();
      });

      test('should show reset image button after upload', async ({
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        const updatePage = new PetUpdatePage(authenticatedPage);
        await updatePage.navigateToUpdatePet(petId);
        await updatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await updatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify reset button appears
        await expect(
          updatePage.imageDropzone.locator('button:has-text("Reset image")')
        ).toBeVisible();
      });

      test('should clear image when clicking reset image button', async ({
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        const updatePage = new PetUpdatePage(authenticatedPage);
        await updatePage.navigateToUpdatePet(petId);
        await updatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await updatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected
        await expect(
          updatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Click reset image
        await updatePage.clickResetImage();

        // Verify image is cleared and default text is shown
        await expect(
          updatePage.imageDropzone.locator('text=Supported formats: PNG, JPG')
        ).toBeVisible();
      });

      test('should update pet with new image and redirect to detail page', async ({
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        const updatePage = new PetUpdatePage(authenticatedPage);
        await updatePage.navigateToUpdatePet(petId);
        await updatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await updatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected before submitting
        await expect(
          updatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Submit the form
        await updatePage.clickSubmit();

        // Should redirect to the pet detail page after successful update
        await expect(authenticatedPage).toHaveURL(
          new RegExp(`/pets/${petId}$`),
          { timeout: 15000 }
        );

        // Verify the pet detail page shows the uploaded image (avatar)
        await expect(
          authenticatedPage.getByTestId('pet-detail-avatar')
        ).toBeVisible({ timeout: 10000 });
      });
    });
  });
});
