import { test, expect } from '../fixtures';

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
    test('should display the pet list page', async ({ petListPage }) => {
      await petListPage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ petListPage }) => {
      await petListPage.expectTitleToBeVisible();
      const titleText = await petListPage.getTitleText();
      expect(titleText).toContain('List of pets');
    });

    test('should display the pets table', async ({ petListPage }) => {
      await petListPage.expectTableToBeVisible();
    });

    test('should display create pet button', async ({ petListPage }) => {
      await petListPage.expectCreatePetButtonToBeVisible();
    });

    test('should have correct URL', async ({ petListPage }) => {
      const url = await petListPage.getCurrentUrl();
      expect(url).toContain('/pets');
    });

    test('should have page parameter in URL', async ({ petListPage }) => {
      const url = await petListPage.getCurrentUrl();
      // The page should automatically add page=1 parameter
      expect(url).toContain('page=1');
    });

    test('should navigate to create pet page when clicking create button', async ({
      petListPage,
    }) => {
      await petListPage.clickCreatePet();
      const url = await petListPage.getCurrentUrl();
      expect(url).toContain('/create-pet');
    });

    test.describe('pagination', () => {
      test('should display paging component', async ({ petListPage }) => {
        await petListPage.waitForPetsToLoad();

        await petListPage.expectPagingToBeVisible();
      });

      test('should show page 1 as active by default', async ({
        petListPage,
      }) => {
        await petListPage.waitForPetsToLoad();

        await petListPage.expectPageToBeActive(1);
      });

      test('should display rows per page selector with default value', async ({
        petListPage,
      }) => {
        await petListPage.waitForPetsToLoad();

        await petListPage.expectRowsPerPageToBe('25');
      });

      test('should change rows per page when selecting different option', async ({
        petListPage,
      }) => {
        await petListPage.waitForPetsToLoad();

        await petListPage.selectRowsPerPage(10);

        await petListPage.expectRowsPerPageToBe('10');
      });
    });

    test.describe('pet rows', () => {
      test('should display pet details in rows when pets exist', async ({
        petListPage,
      }) => {
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
        petListPage,
        petDetailPage,
      }) => {
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

          const url = await petDetailPage.getCurrentUrl();
          expect(url).toContain('/pets/');
        }
      });
    });
  });
});
