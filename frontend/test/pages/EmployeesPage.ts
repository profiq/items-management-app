import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Employees list page (protected route)
 */
export class EmployeesPage extends BasePage {
  readonly pageUrl = '/employees';
  readonly pageTestId = 'employees-page';

  // Locators
  get title() {
    return this.getByTestId('employees-title');
  }

  get table() {
    return this.getByTestId('employees-table');
  }

  get tableBody() {
    return this.getByTestId('employees-table-body');
  }

  get loadingSpinner() {
    return this.getByTestId('employees-loading');
  }

  // Tooltip locators
  get hoverInfoTrigger() {
    return this.getByTestId('employees-hover-info-trigger');
  }

  get hoverInfoContent() {
    return this.getByTestId('employees-hover-info-content');
  }

  get hoverInfoText() {
    return this.getByTestId('employees-hover-info-text');
  }

  get hoverInfoLink() {
    return this.getByTestId('employees-hover-info-link');
  }

  // Paging locators
  get paging() {
    return this.getByTestId('employees-paging');
  }

  get pagingRowsPerPage() {
    return this.getByTestId('employees-paging-rows-per-page');
  }

  get pagingPrevious() {
    return this.getByTestId('employees-paging-previous');
  }

  get pagingNext() {
    return this.getByTestId('employees-paging-next');
  }

  getPagingPageButton(pageNum: number): Locator {
    return this.getByTestId(`employees-paging-page-${pageNum}`);
  }

  getRowsPerPageOption(value: number): Locator {
    return this.getByTestId(`employees-paging-rows-${value}`);
  }

  /**
   * Get all employee rows
   */
  getEmployeeRows(): Locator {
    return this.page.locator('[data-testid^="employee-row-"]');
  }

  /**
   * Get a specific employee row by ID
   */
  getEmployeeRowById(id: string): Locator {
    return this.getByTestId(`employee-row-${id}`);
  }

  /**
   * Get the employee name cell within a row
   */
  getEmployeeNameInRow(row: Locator): Locator {
    return row.locator('[data-testid="employee-name"]');
  }

  /**
   * Get the employee email cell within a row
   */
  getEmployeeEmailInRow(row: Locator): Locator {
    return row.locator('[data-testid="employee-email"]');
  }

  /**
   * Get the employee ID cell within a row
   */
  getEmployeeIdInRow(row: Locator): Locator {
    return row.locator('[data-testid="employee-id"]');
  }

  /**
   * Get the employee photo cell within a row
   */
  getEmployeePhotoInRow(row: Locator): Locator {
    return row.locator('[data-testid="employee-photo"]');
  }

  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the count of employee rows
   */
  async getEmployeeCount(): Promise<number> {
    return await this.getEmployeeRows().count();
  }

  /**
   * Assert that the title is visible
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /**
   * Assert that the title contains expected text
   */
  async expectTitleToContainText(text: string): Promise<void> {
    await expect(this.title).toContainText(text);
  }

  /**
   * Assert that the table is visible
   */
  async expectTableToBeVisible(): Promise<void> {
    await expect(this.table).toBeVisible();
  }

  /**
   * Assert that the loading spinner is visible
   */
  async expectLoadingToBeVisible(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
  }

  /**
   * Assert that the loading spinner is not visible
   */
  async expectLoadingToBeHidden(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden();
  }

  /**
   * Assert that employees are displayed
   */
  async expectEmployeesToBeDisplayed(): Promise<void> {
    await expect(this.getEmployeeRows().first()).toBeVisible();
  }

  /**
   * Assert that a specific number of employees are displayed
   */
  async expectEmployeeCount(count: number): Promise<void> {
    await expect(this.getEmployeeRows()).toHaveCount(count);
  }

  /**
   * Assert that employee with specific ID is visible
   */
  async expectEmployeeRowToBeVisible(id: string): Promise<void> {
    await expect(this.getEmployeeRowById(id)).toBeVisible();
  }

  /**
   * Wait for employees to load (loading spinner to disappear and table to be visible)
   */
  async waitForEmployeesToLoad(): Promise<void> {
    await this.expectTableToBeVisible();
    // Wait for at least one employee row or for loading to complete
    await this.page.waitForSelector('[data-testid^="employee-row-"]', {
      state: 'visible',
      timeout: 30000,
    });
  }

  // Tooltip methods
  /**
   * Hover over the info icon to show tooltip
   */
  async hoverOnInfoIcon(): Promise<void> {
    await this.hoverInfoTrigger.hover();
  }

  /**
   * Assert that the tooltip content is visible
   */
  async expectTooltipToBeVisible(): Promise<void> {
    await expect(this.hoverInfoContent).toBeVisible();
  }

  /**
   * Assert that the tooltip content is hidden
   */
  async expectTooltipToBeHidden(): Promise<void> {
    await expect(this.hoverInfoContent).toBeHidden();
  }

  /**
   * Get the tooltip text
   */
  async getTooltipText(): Promise<string> {
    return (await this.hoverInfoText.textContent()) ?? '';
  }

  /**
   * Assert that the tooltip contains expected text
   */
  async expectTooltipToContainText(text: string): Promise<void> {
    await expect(this.hoverInfoText).toContainText(text);
  }

  /**
   * Assert that the tooltip link is visible
   */
  async expectTooltipLinkToBeVisible(): Promise<void> {
    await expect(this.hoverInfoLink).toBeVisible();
  }

  // Paging methods
  /**
   * Assert that paging is visible
   */
  async expectPagingToBeVisible(): Promise<void> {
    await expect(this.paging).toBeVisible();
  }

  /**
   * Click on a specific page number
   */
  async clickPageNumber(pageNum: number): Promise<void> {
    await this.getPagingPageButton(pageNum).click();
  }

  /**
   * Click the previous page button
   */
  async clickPreviousPage(): Promise<void> {
    await this.pagingPrevious.click();
  }

  /**
   * Click the next page button
   */
  async clickNextPage(): Promise<void> {
    await this.pagingNext.click();
  }

  /**
   * Open the rows per page dropdown
   */
  async openRowsPerPageDropdown(): Promise<void> {
    await this.pagingRowsPerPage.click();
  }

  /**
   * Select a rows per page option
   */
  async selectRowsPerPage(value: number): Promise<void> {
    await this.openRowsPerPageDropdown();
    await this.getRowsPerPageOption(value).click();
  }

  /**
   * Assert that a specific page button is active
   */
  async expectPageToBeActive(pageNum: number): Promise<void> {
    await expect(this.getPagingPageButton(pageNum)).toHaveAttribute(
      'aria-current',
      'page'
    );
  }

  /**
   * Assert that the rows per page dropdown shows a specific value
   */
  async expectRowsPerPageToBe(value: string): Promise<void> {
    await expect(this.pagingRowsPerPage).toContainText(value);
  }
}
