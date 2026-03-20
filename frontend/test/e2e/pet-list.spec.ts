import { test, expect } from '../fixtures';
import { PetListPage } from '../pages';

test.describe('Pet List Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing pets page', async ({
      page,
    }) => {
      // Attempt to navigate to pets page without authentication
      await page.goto('/pets');

      // Should redirect to login page since pets is protected
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the pet list page', async ({ authenticatedPage }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      await petListPage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ authenticatedPage }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      await petListPage.expectTitleToBeVisible();
      const titleText = await petListPage.getTitleText();
      expect(titleText).toContain('List of pets');
    });

    test('should display the pets table', async ({ authenticatedPage }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      await petListPage.expectTableToBeVisible();
    });

    test('should display create pet button', async ({ authenticatedPage }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      await petListPage.expectCreatePetButtonToBeVisible();
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      const url = await petListPage.getCurrentUrl();
      expect(url).toContain('/pets');
    });

    test('should have page parameter in URL', async ({ authenticatedPage }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      // The page should automatically add page=1 parameter
      await expect(authenticatedPage).toHaveURL(/page=1/);
    });

    test('should navigate to create pet page when clicking create button', async ({
      authenticatedPage,
    }) => {
      const petListPage = new PetListPage(authenticatedPage);
      await petListPage.navigate();

      await petListPage.clickCreatePet();

      await expect(authenticatedPage).toHaveURL(/\/create-pet/);
    });

    test.describe('pagination', () => {
      test('should display paging component', async ({ authenticatedPage }) => {
        const petListPage = new PetListPage(authenticatedPage);
        await petListPage.navigate();
        await petListPage.waitForPetsToLoad();

        await petListPage.expectPagingToBeVisible();
      });

      test('should show page 1 as active by default', async ({
        authenticatedPage,
      }) => {
        const petListPage = new PetListPage(authenticatedPage);
        await petListPage.navigate();
        await petListPage.waitForPetsToLoad();

        await petListPage.expectPageToBeActive(1);
      });

      test('should display rows per page selector with default value', async ({
        authenticatedPage,
      }) => {
        const petListPage = new PetListPage(authenticatedPage);
        await petListPage.navigate();
        await petListPage.waitForPetsToLoad();

        await petListPage.expectRowsPerPageToBe('25');
      });

      test('should change rows per page when selecting different option', async ({
        authenticatedPage,
      }) => {
        const petListPage = new PetListPage(authenticatedPage);
        await petListPage.navigate();
        await petListPage.waitForPetsToLoad();

        await petListPage.selectRowsPerPage(10);

        await petListPage.expectRowsPerPageToBe('10');
      });
    });

    test.describe('pet rows', () => {
      test('should display pet details in rows when pets exist', async ({
        authenticatedPage,
      }) => {
        const petListPage = new PetListPage(authenticatedPage);
        await petListPage.navigate();
        await petListPage.waitForPetsToLoad();

        // Check if there are any pets
        const petCount = await petListPage.getPetCount();
        if (petCount > 0) {
          // Get the first pet row
          const firstRow = petListPage.getPetRows().first();
          await expect(firstRow).toBeVisible();
        }
      });

      test('should navigate to pet detail when clicking pet row', async ({
        authenticatedPage,
      }) => {
        const petListPage = new PetListPage(authenticatedPage);
        await petListPage.navigate();
        await petListPage.waitForPetsToLoad();

        // Check if there are any pets
        const petCount = await petListPage.getPetCount();
        if (petCount > 0) {
          // Click on the first pet's ID link
          const firstPetIdCell = petListPage
            .getPetRows()
            .first()
            .locator('a')
            .first();
          await firstPetIdCell.click();

          await expect(authenticatedPage).toHaveURL(/\/pets\/\d+/);
        }
      });
    });
  });
});
