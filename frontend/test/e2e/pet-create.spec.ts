import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '../fixtures';
import { PetCreatePage } from '../pages';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_IMAGE_PATH = path.join(__dirname, '../assets/test-image.png');

test.describe('Pet Create Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing create pet page', async ({
      page,
    }) => {
      await page.goto('/create-pet');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the create pet page', async ({
      authenticatedPage,
    }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      await createPage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ authenticatedPage }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      await createPage.expectTitleToBeVisible();
      const titleText = await createPage.getTitleText();
      expect(titleText).toContain('Create a Pet');
    });

    test('should display the form', async ({ authenticatedPage }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      await createPage.expectFormToBeVisible();
    });

    test('should display all form fields', async ({ authenticatedPage }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      await createPage.expectNameInputToBeVisible();
      await createPage.expectOwnerInputToBeVisible();
      await expect(createPage.speciesInput).toBeVisible();
      await expect(createPage.raceInput).toBeVisible();
      await createPage.expectImageDropzoneToBeVisible();
    });

    test('should display submit and reset buttons', async ({
      authenticatedPage,
    }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      await createPage.expectSubmitButtonToBeVisible();
      await createPage.expectResetButtonToBeVisible();
    });

    test('should clear form when clicking reset', async ({
      authenticatedPage,
    }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      // Fill some fields
      await createPage.fillName('Test Pet');
      await createPage.fillSpecies('Dog');
      await createPage.fillRace('Labrador');

      // Verify fields are filled
      await createPage.expectNameInputToHaveValue('Test Pet');

      // Click reset
      await createPage.clickReset();

      // Verify fields are cleared
      await createPage.expectNameInputToHaveValue('');
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const createPage = new PetCreatePage(authenticatedPage);
      await createPage.navigate();

      const url = await createPage.getCurrentUrl();
      expect(url).toContain('/create-pet');
    });

    test.describe('image upload', () => {
      test('should display dropzone for image upload', async ({
        authenticatedPage,
      }) => {
        const createPage = new PetCreatePage(authenticatedPage);
        await createPage.navigate();

        await createPage.expectImageDropzoneToBeVisible();
        // Should show default text when no image selected
        await expect(
          createPage.imageDropzone.locator('text=Supported formats: PNG, JPG')
        ).toBeVisible();
      });

      test('should upload an image file', async ({ authenticatedPage }) => {
        const createPage = new PetCreatePage(authenticatedPage);
        await createPage.navigate();

        // Upload the test image
        await createPage.uploadImage(TEST_IMAGE_PATH);

        // Verify the file name is displayed
        await expect(
          createPage.imageDropzone.locator('text=Selected:')
        ).toBeVisible();
        await expect(
          createPage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();
      });

      test('should show reset image button after upload', async ({
        authenticatedPage,
      }) => {
        const createPage = new PetCreatePage(authenticatedPage);
        await createPage.navigate();

        // Upload the test image
        await createPage.uploadImage(TEST_IMAGE_PATH);

        // Verify reset button appears
        await expect(
          createPage.imageDropzone.locator('button:has-text("Reset image")')
        ).toBeVisible();
      });

      test('should clear image when clicking reset image button', async ({
        authenticatedPage,
      }) => {
        const createPage = new PetCreatePage(authenticatedPage);
        await createPage.navigate();

        // Upload the test image
        await createPage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected
        await expect(
          createPage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Click reset image
        await createPage.clickResetImage();

        // Verify image is cleared and default text is shown
        await expect(
          createPage.imageDropzone.locator('text=Supported formats: PNG, JPG')
        ).toBeVisible();
      });

      test('should create pet with image and redirect to detail page', async ({
        authenticatedPage,
      }) => {
        const createPage = new PetCreatePage(authenticatedPage);
        await createPage.navigate();

        // Fill in all required fields
        await createPage.fillName('Test Pet With Image');
        await createPage.fillSpecies('Dog');
        await createPage.fillRace('Golden Retriever');

        // Select an owner from the combobox
        await createPage.ownerInput.click();
        // Wait for employees to load and select the first one
        const firstOption = authenticatedPage.getByRole('option').first();
        await firstOption.waitFor({ state: 'visible', timeout: 10000 });
        await firstOption.click();

        // Upload the test image
        await createPage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected before submitting
        await expect(
          createPage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Submit the form
        await createPage.clickSubmit();

        // Should redirect to the pet detail page after successful creation
        await expect(authenticatedPage).toHaveURL(/\/pets\/\d+$/, {
          timeout: 15000,
        });

        // Verify the pet detail page shows the uploaded image (avatar)
        await expect(
          authenticatedPage.getByTestId('pet-detail-avatar')
        ).toBeVisible({ timeout: 10000 });
      });
    });
  });
});
