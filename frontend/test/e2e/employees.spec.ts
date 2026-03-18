import { test, expect } from '../fixtures';
import { EmployeesPage } from '../pages';

test.describe('Employees Page', () => {
  test.describe('when not authenticated', () => {
    test('should redirect to login when accessing employees page', async ({
      page,
    }) => {
      // Attempt to navigate to employees page without authentication
      await page.goto('/employees');

      // Should redirect to login page since employees is protected
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('when authenticated', () => {
    test('should display the employees page', async ({ authenticatedPage }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      await employeesPage.expectPageToBeVisible();
    });

    test('should display the correct title', async ({ authenticatedPage }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      await employeesPage.expectTitleToBeVisible();
      const titleText = await employeesPage.getTitleText();
      expect(titleText).toContain('List of employees');
    });

    test('should display the employees table', async ({
      authenticatedPage,
    }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      await employeesPage.expectTableToBeVisible();
    });

    test('should display employees after loading', async ({
      authenticatedPage,
    }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      // Wait for employees to load
      await employeesPage.waitForEmployeesToLoad();

      // Verify employees are displayed
      await employeesPage.expectEmployeesToBeDisplayed();
    });

    test('should display employee details in rows', async ({
      authenticatedPage,
    }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      // Wait for employees to load
      await employeesPage.waitForEmployeesToLoad();

      // Get the first employee row
      const firstRow = employeesPage.getEmployeeRows().first();
      await expect(firstRow).toBeVisible();

      // Verify the row contains expected elements
      const nameCell = employeesPage.getEmployeeNameInRow(firstRow);
      const emailCell = employeesPage.getEmployeeEmailInRow(firstRow);
      const idCell = employeesPage.getEmployeeIdInRow(firstRow);
      const photoCell = employeesPage.getEmployeePhotoInRow(firstRow);

      await expect(nameCell).toBeVisible();
      await expect(emailCell).toBeVisible();
      await expect(idCell).toBeVisible();
      await expect(photoCell).toBeVisible();
    });

    test('should have correct URL', async ({ authenticatedPage }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      const url = await employeesPage.getCurrentUrl();
      expect(url).toContain('/employees');
    });

    test('should have page parameter in URL', async ({ authenticatedPage }) => {
      const employeesPage = new EmployeesPage(authenticatedPage);
      await employeesPage.navigate();

      // The page should automatically add page=1 parameter
      await expect(authenticatedPage).toHaveURL(/page=1/);
    });

    test.describe('tooltip', () => {
      test('should display tooltip on hover', async ({ authenticatedPage }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();

        // Tooltip should not be visible initially
        await employeesPage.expectTooltipToBeHidden();

        // Hover over the info icon
        await employeesPage.hoverOnInfoIcon();

        // Tooltip should be visible
        await employeesPage.expectTooltipToBeVisible();
      });

      test('should display correct tooltip text', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();

        await employeesPage.hoverOnInfoIcon();

        await employeesPage.expectTooltipToContainText('Google Workspace API');
      });

      test('should display README link in tooltip', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();

        await employeesPage.hoverOnInfoIcon();

        await employeesPage.expectTooltipLinkToBeVisible();
      });
    });

    test.describe('pagination', () => {
      test('should display paging component', async ({ authenticatedPage }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();
        await employeesPage.waitForEmployeesToLoad();

        await employeesPage.expectPagingToBeVisible();
      });

      test('should show page 1 as active by default', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();
        await employeesPage.waitForEmployeesToLoad();

        await employeesPage.expectPageToBeActive(1);
      });

      test('should navigate to next page when clicking next', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();
        await employeesPage.waitForEmployeesToLoad();

        // Only test if there are multiple pages
        const employeeCount = await employeesPage.getEmployeeCount();
        if (employeeCount > 25) {
          await employeesPage.clickNextPage();
          await expect(authenticatedPage).toHaveURL(/page=2/);
        }
      });

      test('should navigate to specific page when clicking page number', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();
        await employeesPage.waitForEmployeesToLoad();

        // Only test if there are multiple pages
        const employeeCount = await employeesPage.getEmployeeCount();
        if (employeeCount > 25) {
          await employeesPage.clickPageNumber(2);
          await expect(authenticatedPage).toHaveURL(/page=2/);
          await employeesPage.expectPageToBeActive(2);
        }
      });

      test('should display rows per page selector', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();
        await employeesPage.waitForEmployeesToLoad();

        await employeesPage.expectRowsPerPageToBe('25');
      });

      test('should change rows per page when selecting different option', async ({
        authenticatedPage,
      }) => {
        const employeesPage = new EmployeesPage(authenticatedPage);
        await employeesPage.navigate();
        await employeesPage.waitForEmployeesToLoad();

        await employeesPage.selectRowsPerPage(10);

        await employeesPage.expectRowsPerPageToBe('10');
      });
    });
  });
});
