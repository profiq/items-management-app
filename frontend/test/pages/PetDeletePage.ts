import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Pet Delete page (protected route)
 */
export class PetDeletePage extends BasePage {
  readonly pageUrl = '/pets';
  readonly pageTestId = 'pet-delete-page';

  /**
   * Navigate to a specific pet's delete page
   */
  async navigateToDeletePet(id: number | string): Promise<void> {
    await this.page.goto(`/pets/${id}/delete`);
    await this.waitForPageLoad();
  }

  // Locators
  get title(): Locator {
    return this.getByTestId('pet-delete-title');
  }

  get confirmationMessage(): Locator {
    return this.getByTestId('pet-delete-confirmation');
  }

  get confirmDeleteButton(): Locator {
    return this.getByTestId('pet-delete-confirm-button');
  }

  // Actions
  /**
   * Click the confirm delete button
   */
  async clickConfirmDelete(): Promise<void> {
    await this.confirmDeleteButton.click();
  }

  // Getters
  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the confirmation message text
   */
  async getConfirmationMessageText(): Promise<string> {
    return (await this.confirmationMessage.textContent()) ?? '';
  }

  // Assertions
  /**
   * Assert that the title is visible
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /**
   * Assert that the title contains expected pet name
   */
  async expectTitleToContainPetName(name: string): Promise<void> {
    await expect(this.title).toContainText(name);
  }

  /**
   * Assert that the confirmation message is visible
   */
  async expectConfirmationMessageToBeVisible(): Promise<void> {
    await expect(this.confirmationMessage).toBeVisible();
  }

  /**
   * Assert that the confirm delete button is visible
   */
  async expectConfirmDeleteButtonToBeVisible(): Promise<void> {
    await expect(this.confirmDeleteButton).toBeVisible();
  }

  /**
   * Wait for the delete page to load
   */
  async waitForDeletePageToLoad(): Promise<void> {
    await this.expectTitleToBeVisible();
    await this.expectConfirmDeleteButtonToBeVisible();
  }
}
