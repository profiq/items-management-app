import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Pet Detail page (protected route)
 */
export class PetDetailPage extends BasePage {
  readonly pageUrl = '/pets';
  readonly pageTestId = 'pet-detail-page';

  /**
   * Navigate to a specific pet's detail page
   */
  async navigateToPet(id: number | string): Promise<void> {
    await this.page.goto(`/pets/${id}`);
    await this.waitForPageLoad();
  }

  // Page-level locators
  get title(): Locator {
    return this.getByTestId('pet-detail-page-title');
  }

  get detailContainer(): Locator {
    return this.getByTestId('pet-detail');
  }

  get createVisitButton(): Locator {
    return this.getByTestId('pet-detail-create-visit-button');
  }

  get updateButton(): Locator {
    return this.getByTestId('pet-detail-update-button');
  }

  get deleteButton(): Locator {
    return this.getByTestId('pet-detail-delete-button');
  }

  // Pet detail locators
  get avatar(): Locator {
    return this.getByTestId('pet-detail-avatar');
  }

  get petId(): Locator {
    return this.getByTestId('pet-detail-id');
  }

  get petName(): Locator {
    return this.getByTestId('pet-detail-name');
  }

  get petSpecies(): Locator {
    return this.getByTestId('pet-detail-species');
  }

  get petRace(): Locator {
    return this.getByTestId('pet-detail-race');
  }

  // Owner locators
  get ownerContainer(): Locator {
    return this.getByTestId('pet-detail-owner');
  }

  get ownerName(): Locator {
    return this.getByTestId('pet-detail-owner-name');
  }

  get ownerId(): Locator {
    return this.getByTestId('pet-detail-owner-id');
  }

  // Actions
  /**
   * Click the create visit button
   */
  async clickCreateVisit(): Promise<void> {
    await this.createVisitButton.click();
  }

  /**
   * Click the update button to navigate to update page
   */
  async clickUpdate(): Promise<void> {
    await this.updateButton.click();
  }

  /**
   * Click the delete button to navigate to delete page
   */
  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  // Getters for text content
  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the pet ID text
   */
  async getPetIdText(): Promise<string> {
    return (await this.petId.textContent()) ?? '';
  }

  /**
   * Get the pet name text
   */
  async getPetNameText(): Promise<string> {
    return (await this.petName.textContent()) ?? '';
  }

  /**
   * Get the pet species text
   */
  async getPetSpeciesText(): Promise<string> {
    return (await this.petSpecies.textContent()) ?? '';
  }

  /**
   * Get the pet race text
   */
  async getPetRaceText(): Promise<string> {
    return (await this.petRace.textContent()) ?? '';
  }

  /**
   * Get the owner name text
   */
  async getOwnerNameText(): Promise<string> {
    return (await this.ownerName.textContent()) ?? '';
  }

  /**
   * Get the owner ID text
   */
  async getOwnerIdText(): Promise<string> {
    return (await this.ownerId.textContent()) ?? '';
  }

  // Assertions
  /**
   * Assert that the title is visible
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /**
   * Assert that the detail container is visible
   */
  async expectDetailToBeVisible(): Promise<void> {
    await expect(this.detailContainer).toBeVisible();
  }

  /**
   * Assert that the avatar is visible
   */
  async expectAvatarToBeVisible(): Promise<void> {
    await expect(this.avatar).toBeVisible();
  }

  /**
   * Assert that the pet ID contains expected text
   */
  async expectPetIdToContain(id: string): Promise<void> {
    await expect(this.petId).toContainText(id);
  }

  /**
   * Assert that the pet name contains expected text
   */
  async expectPetNameToContain(name: string): Promise<void> {
    await expect(this.petName).toContainText(name);
  }

  /**
   * Assert that the pet species contains expected text
   */
  async expectPetSpeciesToContain(species: string): Promise<void> {
    await expect(this.petSpecies).toContainText(species);
  }

  /**
   * Assert that the pet race contains expected text
   */
  async expectPetRaceToContain(race: string): Promise<void> {
    await expect(this.petRace).toContainText(race);
  }

  /**
   * Assert that the owner section is visible
   */
  async expectOwnerToBeVisible(): Promise<void> {
    await expect(this.ownerContainer).toBeVisible();
  }

  /**
   * Assert that the owner name contains expected text
   */
  async expectOwnerNameToContain(name: string): Promise<void> {
    await expect(this.ownerName).toContainText(name);
  }

  /**
   * Assert that the create visit button is visible
   */
  async expectCreateVisitButtonToBeVisible(): Promise<void> {
    await expect(this.createVisitButton).toBeVisible();
  }

  /**
   * Assert that the update button is visible
   */
  async expectUpdateButtonToBeVisible(): Promise<void> {
    await expect(this.updateButton).toBeVisible();
  }

  /**
   * Assert that the delete button is visible
   */
  async expectDeleteButtonToBeVisible(): Promise<void> {
    await expect(this.deleteButton).toBeVisible();
  }

  /**
   * Wait for pet details to load
   */
  async waitForPetToLoad(): Promise<void> {
    await this.expectDetailToBeVisible();
  }
}
