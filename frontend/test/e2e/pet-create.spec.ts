import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '../fixtures';

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
    test('should display the create pet page', async ({ petCreatePage }) => {
      await petCreatePage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ petCreatePage }) => {
      await petCreatePage.expectTitleToBeVisible();
      const titleText = await petCreatePage.getTitleText();
      expect(titleText).toContain('Create a Pet');
    });

    test('should display the form', async ({ petCreatePage }) => {
      await petCreatePage.expectFormToBeVisible();
    });

    test('should display all form fields', async ({ petCreatePage }) => {
      await petCreatePage.expectNameInputToBeVisible();
      await petCreatePage.expectOwnerInputToBeVisible();
      await expect(petCreatePage.speciesInput).toBeVisible();
      await expect(petCreatePage.raceInput).toBeVisible();
      await petCreatePage.expectImageDropzoneToBeVisible();
    });

    test('should display submit and reset buttons', async ({
      petCreatePage,
    }) => {
      await petCreatePage.expectSubmitButtonToBeVisible();
      await petCreatePage.expectResetButtonToBeVisible();
    });

    test('should clear form when clicking reset', async ({ petCreatePage }) => {
      // Fill some fields
      await petCreatePage.fillName('Test Pet');
      await petCreatePage.fillSpecies('Dog');
      await petCreatePage.fillRace('Labrador');

      // Verify fields are filled
      await petCreatePage.expectNameInputToHaveValue('Test Pet');

      // Click reset
      await petCreatePage.clickReset();

      // Verify fields are cleared
      await petCreatePage.expectNameInputToHaveValue('');
    });

    test('should have correct URL', async ({ petCreatePage }) => {
      const url = await petCreatePage.getCurrentUrl();
      expect(url).toContain('/create-pet');
    });

    test.describe('image upload', () => {
      test('should display dropzone for image upload', async ({
        petCreatePage,
      }) => {
        await petCreatePage.expectImageDropzoneToBeVisible();
        // Should show default text when no image selected
        await expect(
          petCreatePage.imageDropzone.locator(
            'text=Supported formats: PNG, JPG'
          )
        ).toBeVisible();
      });

      test('should upload an image file', async ({ petCreatePage }) => {
        // Upload the test image
        await petCreatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify the file name is displayed
        await expect(
          petCreatePage.imageDropzone.locator('text=Selected:')
        ).toBeVisible();
        await expect(
          petCreatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();
      });

      test('should show reset image button after upload', async ({
        petCreatePage,
      }) => {
        // Upload the test image
        await petCreatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify reset button appears
        await expect(
          petCreatePage.imageDropzone.locator('button:has-text("Reset image")')
        ).toBeVisible();
      });

      test('should clear image when clicking reset image button', async ({
        petCreatePage,
      }) => {
        // Upload the test image
        await petCreatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected
        await expect(
          petCreatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Click reset image
        await petCreatePage.clickResetImage();

        // Verify image is cleared and default text is shown
        await expect(
          petCreatePage.imageDropzone.locator(
            'text=Supported formats: PNG, JPG'
          )
        ).toBeVisible();
      });

      test('should create pet with image and redirect to detail page', async ({
        petCreatePage,
        petDetailPage,
        authenticatedPage,
      }) => {
        // Fill in all required fields
        await petCreatePage.fillName('Test Pet With Image');
        await petCreatePage.fillSpecies('Dog');
        await petCreatePage.fillRace('Golden Retriever');

        // Select an owner from the combobox
        await petCreatePage.ownerInput.click();
        // Wait for employees to load and select the first one
        const firstOption = authenticatedPage.getByRole('option').first();
        await firstOption.waitFor({ state: 'visible', timeout: 10000 });
        await firstOption.click();

        // Upload the test image
        await petCreatePage.uploadImage(TEST_IMAGE_PATH);

        // Verify image is selected before submitting
        await expect(
          petCreatePage.imageDropzone.locator('text=test-image.png')
        ).toBeVisible();

        // Submit the form
        await petCreatePage.clickSubmit();

        // Should redirect to the pet detail page after successful creation
        await authenticatedPage.waitForURL(/\/pets\/\d+$/, {
          timeout: 15000,
        });
        const url = await petDetailPage.getCurrentUrl();
        expect(url).toContain('/pets/');

        // Verify the pet detail page shows the uploaded image (avatar)
        await expect(
          authenticatedPage.getByTestId('pet-detail-avatar')
        ).toBeVisible({ timeout: 10000 });
      });
    });
  });
});
