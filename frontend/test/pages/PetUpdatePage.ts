import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Pet Update page (protected route)
 */
export class PetUpdatePage extends BasePage {
  readonly pageUrl = '/pets';
  readonly pageTestId = 'pet-update-page';

  /**
   * Navigate to a specific pet's update page
   */
  async navigateToUpdatePet(id: number | string): Promise<void> {
    await this.page.goto(`/pets/${id}/update`);
    await this.waitForPageLoad();
  }

  // Locators
  get title(): Locator {
    return this.getByTestId('pet-update-title');
  }

  get form(): Locator {
    return this.getByTestId('pet-update-form');
  }

  get nameInput(): Locator {
    return this.getByTestId('pet-update-name-input');
  }

  get ownerCombobox(): Locator {
    return this.getByTestId('pet-update-owner-combobox');
  }

  get ownerInput(): Locator {
    return this.getByTestId('pet-update-owner-input');
  }

  get speciesInput(): Locator {
    return this.getByTestId('pet-update-species-input');
  }

  get raceInput(): Locator {
    return this.getByTestId('pet-update-race-input');
  }

  get imageDropzone(): Locator {
    return this.getByTestId('pet-update-image-dropzone');
  }

  get resetButton(): Locator {
    return this.getByTestId('pet-update-reset-button');
  }

  get submitButton(): Locator {
    return this.getByTestId('pet-update-submit-button');
  }

  // Actions
  /**
   * Fill the pet name input
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }

  /**
   * Fill the owner input (combobox)
   */
  async fillOwner(ownerName: string): Promise<void> {
    await this.ownerInput.clear();
    await this.ownerInput.fill(ownerName);
  }

  /**
   * Select an owner from the combobox dropdown
   */
  async selectOwner(ownerName: string): Promise<void> {
    await this.ownerInput.click();
    await this.ownerInput.fill(ownerName);
    await this.page.getByRole('option', { name: ownerName }).click();
  }

  /**
   * Fill the species input
   */
  async fillSpecies(species: string): Promise<void> {
    await this.speciesInput.clear();
    await this.speciesInput.fill(species);
  }

  /**
   * Fill the race input
   */
  async fillRace(race: string): Promise<void> {
    await this.raceInput.clear();
    await this.raceInput.fill(race);
  }

  /**
   * Click the reset button
   */
  async clickReset(): Promise<void> {
    await this.resetButton.click();
  }

  /**
   * Click the submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Fill all form fields and submit
   */
  async updatePet(data: {
    name?: string;
    ownerName?: string;
    species?: string;
    race?: string;
  }): Promise<void> {
    if (data.name) await this.fillName(data.name);
    if (data.ownerName) await this.selectOwner(data.ownerName);
    if (data.species) await this.fillSpecies(data.species);
    if (data.race) await this.fillRace(data.race);
    await this.clickSubmit();
  }

  // Getters
  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the current value of name input
   */
  async getNameValue(): Promise<string> {
    return (await this.nameInput.inputValue()) ?? '';
  }

  /**
   * Get the current value of species input
   */
  async getSpeciesValue(): Promise<string> {
    return (await this.speciesInput.inputValue()) ?? '';
  }

  /**
   * Get the current value of race input
   */
  async getRaceValue(): Promise<string> {
    return (await this.raceInput.inputValue()) ?? '';
  }

  // Assertions
  /**
   * Assert that the title is visible
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /**
   * Assert that the form is visible
   */
  async expectFormToBeVisible(): Promise<void> {
    await expect(this.form).toBeVisible();
  }

  /**
   * Assert that the name input is visible
   */
  async expectNameInputToBeVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
  }

  /**
   * Assert that the name input has a specific value
   */
  async expectNameInputToHaveValue(value: string): Promise<void> {
    await expect(this.nameInput).toHaveValue(value);
  }

  /**
   * Assert that the species input has a specific value
   */
  async expectSpeciesInputToHaveValue(value: string): Promise<void> {
    await expect(this.speciesInput).toHaveValue(value);
  }

  /**
   * Assert that the race input has a specific value
   */
  async expectRaceInputToHaveValue(value: string): Promise<void> {
    await expect(this.raceInput).toHaveValue(value);
  }

  /**
   * Assert that the submit button is visible
   */
  async expectSubmitButtonToBeVisible(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Assert that the reset button is visible
   */
  async expectResetButtonToBeVisible(): Promise<void> {
    await expect(this.resetButton).toBeVisible();
  }

  /**
   * Wait for the update page to load with form
   */
  async waitForUpdatePageToLoad(): Promise<void> {
    await this.expectFormToBeVisible();
    await this.expectSubmitButtonToBeVisible();
  }
}
