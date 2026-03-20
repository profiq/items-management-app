import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Pet List page (protected route)
 */
export class PetListPage extends BasePage {
  readonly pageUrl = '/pets';
  readonly pageTestId = 'pet-list-page';

  // Locators
  get title(): Locator {
    return this.getByTestId('pet-list-title');
  }

  get table(): Locator {
    return this.getByTestId('pet-table');
  }

  get tableBody(): Locator {
    return this.getByTestId('pet-table-body');
  }

  get createPetButton(): Locator {
    return this.getByTestId('pet-list-create-button');
  }

  // Paging locators
  get paging(): Locator {
    return this.getByTestId('paging');
  }

  get pagingRowsPerPage(): Locator {
    return this.getByTestId('paging-rows-per-page');
  }

  get pagingPrevious(): Locator {
    return this.getByTestId('paging-previous');
  }

  get pagingNext(): Locator {
    return this.getByTestId('paging-next');
  }

  getPagingPageButton(pageNum: number): Locator {
    return this.getByTestId(`paging-page-${pageNum}`);
  }

  getRowsPerPageOption(value: number): Locator {
    return this.getByTestId(`paging-rows-${value}`);
  }

  // Pet row locators
  /**
   * Get all pet rows
   */
  getPetRows(): Locator {
    return this.page.locator('[data-testid^="pet-row-"]');
  }

  /**
   * Get a specific pet row by ID
   */
  getPetRowById(id: number | string): Locator {
    return this.getByTestId(`pet-row-${id}`);
  }

  /**
   * Get the ID cell for a specific pet
   */
  getPetIdCell(id: number | string): Locator {
    return this.getByTestId(`pet-row-${id}-id`);
  }

  /**
   * Get the name cell for a specific pet
   */
  getPetNameCell(id: number | string): Locator {
    return this.getByTestId(`pet-row-${id}-name`);
  }

  /**
   * Get the species cell for a specific pet
   */
  getPetSpeciesCell(id: number | string): Locator {
    return this.getByTestId(`pet-row-${id}-species`);
  }

  /**
   * Get the race cell for a specific pet
   */
  getPetRaceCell(id: number | string): Locator {
    return this.getByTestId(`pet-row-${id}-race`);
  }

  /**
   * Get the image cell for a specific pet
   */
  getPetImageCell(id: number | string): Locator {
    return this.getByTestId(`pet-row-${id}-image`);
  }

  // Actions
  /**
   * Click on a pet row to navigate to pet details
   */
  async clickPetRow(id: number | string): Promise<void> {
    await this.getPetIdCell(id).click();
  }

  /**
   * Click the create pet button
   */
  async clickCreatePet(): Promise<void> {
    await this.createPetButton.click();
  }

  // Paging actions
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

  // Assertions
  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the count of pet rows
   */
  async getPetCount(): Promise<number> {
    return await this.getPetRows().count();
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
   * Assert that a specific number of pets is displayed
   */
  async expectPetCountToBe(count: number): Promise<void> {
    await expect(this.getPetRows()).toHaveCount(count);
  }

  /**
   * Assert that pet with specific ID is visible
   */
  async expectPetRowToBeVisible(id: number | string): Promise<void> {
    await expect(this.getPetRowById(id)).toBeVisible();
  }

  /**
   * Assert that the create pet button is visible
   */
  async expectCreatePetButtonToBeVisible(): Promise<void> {
    await expect(this.createPetButton).toBeVisible();
  }

  /**
   * Wait for pets to load (table to be visible with at least one pet row or empty)
   */
  async waitForPetsToLoad(): Promise<void> {
    await this.expectTableToBeVisible();
  }

  // Paging assertions
  /**
   * Assert that paging is visible
   */
  async expectPagingToBeVisible(): Promise<void> {
    await expect(this.paging).toBeVisible();
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
