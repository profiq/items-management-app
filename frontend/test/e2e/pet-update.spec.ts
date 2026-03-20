import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '../fixtures';
import { PetListPage } from '../pages';
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
      petUpdatePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petUpdatePage.navigateToUpdatePet(petId);

      await petUpdatePage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({
      petUpdatePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petUpdatePage.navigateToUpdatePet(petId);
      await petUpdatePage.waitForUpdatePageToLoad();

      await petUpdatePage.expectTitleToBeVisible();
      const titleText = await petUpdatePage.getTitleText();
      expect(titleText).toContain('Update a Pet');
    });

    test('should display the form with pre-filled values', async ({
      petUpdatePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petUpdatePage.navigateToUpdatePet(petId);
      await petUpdatePage.waitForUpdatePageToLoad();

      await petUpdatePage.expectFormToBeVisible();
      // Name should be pre-filled (not empty)
      const nameValue = await petUpdatePage.getNameValue();
      expect(nameValue.length).toBeGreaterThan(0);
    });

    test('should display submit and reset buttons', async ({
      petUpdatePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petUpdatePage.navigateToUpdatePet(petId);
      await petUpdatePage.waitForUpdatePageToLoad();

      await petUpdatePage.expectSubmitButtonToBeVisible();
      await petUpdatePage.expectResetButtonToBeVisible();
    });

    test('should have correct URL', async ({
      petUpdatePage,
      authenticatedPage,
    }) => {
      const petId = await getFirstPetId(authenticatedPage);
      if (!petId) {
        test.skip();
        return;
      }

      await petUpdatePage.navigateToUpdatePet(petId);

      const url = await petUpdatePage.getCurrentUrl();
      expect(url).toContain(`/pets/${petId}/update`);
    });

    test.describe('image upload', () => {
      test('should display dropzone for image upload', async ({
        petUpdatePage,
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        await petUpdatePage.navigateToUpdatePet(petId);
        await petUpdatePage.waitForUpdatePageToLoad();

        await expect(petUpdatePage.imageDropzone).toBeVisible();
      });

      test('should upload an image file', async ({
        petUpdatePage,
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        await petUpdatePage.navigateToUpdatePet(petId);
        await petUpdatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await petUpdatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify the file name is displayed
        await expect(
          petUpdatePage.imageDropzone.locator('text=Selected:')
        ).toBeVisible();
        await expect(
          petUpdatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();
      });

      test('should show reset image button after upload', async ({
        petUpdatePage,
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        await petUpdatePage.navigateToUpdatePet(petId);
        await petUpdatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await petUpdatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify reset button appears
        await expect(
          petUpdatePage.imageDropzone.locator('button:has-text("Reset image")')
        ).toBeVisible();
      });

      test('should clear image when clicking reset image button', async ({
        petUpdatePage,
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        await petUpdatePage.navigateToUpdatePet(petId);
        await petUpdatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await petUpdatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected
        await expect(
          petUpdatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Click reset image
        await petUpdatePage.clickResetImage();

        // Verify image is cleared and default text is shown
        await expect(
          petUpdatePage.imageDropzone.locator(
            'text=Supported formats: PNG, JPG'
          )
        ).toBeVisible();
      });

      test('should update pet with new image and redirect to detail page', async ({
        petUpdatePage,
        petDetailPage,
        authenticatedPage,
      }) => {
        const petId = await getFirstPetId(authenticatedPage);
        if (!petId) {
          test.skip();
          return;
        }

        await petUpdatePage.navigateToUpdatePet(petId);
        await petUpdatePage.waitForUpdatePageToLoad();

        // Upload the test image
        await petUpdatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected before submitting
        await expect(
          petUpdatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Submit the form
        await petUpdatePage.clickSubmit();

        // Should redirect to the pet detail page after successful update
        await authenticatedPage.waitForURL(new RegExp(`/pets/${petId}$`), {
          timeout: 15000,
        });
        const url = await petDetailPage.getCurrentUrl();
        expect(url).toContain(`/pets/${petId}`);

        // Verify the pet detail page shows the uploaded image (avatar)
        await expect(
          authenticatedPage.getByTestId('pet-detail-avatar')
        ).toBeVisible({ timeout: 10000 });
      });
    });
  });
});
