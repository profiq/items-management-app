import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Pet Create page (protected route)
 */
export class PetCreatePage extends BasePage {
  readonly pageUrl = '/create-pet';
  readonly pageTestId = 'pet-create-page';

  // Locators
  get title(): Locator {
    return this.getByTestId('pet-create-title');
  }

  get form(): Locator {
    return this.getByTestId('pet-create-form');
  }

  get nameInput(): Locator {
    return this.getByTestId('pet-create-name-input');
  }

  get ownerCombobox(): Locator {
    return this.getByTestId('pet-create-owner-combobox');
  }

  get ownerInput(): Locator {
    return this.getByTestId('pet-create-owner-input');
  }

  get speciesInput(): Locator {
    return this.getByTestId('pet-create-species-input');
  }

  get raceInput(): Locator {
    return this.getByTestId('pet-create-race-input');
  }

  get imageDropzone(): Locator {
    return this.getByTestId('pet-create-image-dropzone');
  }

  get resetButton(): Locator {
    return this.getByTestId('pet-create-reset-button');
  }

  get submitButton(): Locator {
    return this.getByTestId('pet-create-submit-button');
  }

  // Actions
  /**
   * Fill the pet name input
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Fill the owner input (combobox)
   */
  async fillOwner(ownerName: string): Promise<void> {
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
    await this.speciesInput.fill(species);
  }

  /**
   * Fill the race input
   */
  async fillRace(race: string): Promise<void> {
    await this.raceInput.fill(race);
  }

  /**
   * Upload an image file to the dropzone
   */
  async uploadImage(filePath: string): Promise<void> {
    // The hidden file input is associated with the dropzone
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Get the selected file name text from the dropzone
   */
  async getSelectedFileName(): Promise<string | null> {
    const selectedText = this.imageDropzone.locator('text=Selected:');
    if (await selectedText.isVisible()) {
      const container = this.imageDropzone.locator('.text-xs');
      return (await container.textContent()) ?? null;
    }
    return null;
  }

  /**
   * Click the reset image button in the dropzone
   */
  async clickResetImage(): Promise<void> {
    await this.imageDropzone.locator('button:has-text("Reset image")').click();
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
  async createPet(data: {
    name: string;
    ownerName: string;
    species: string;
    race: string;
  }): Promise<void> {
    await this.fillName(data.name);
    await this.selectOwner(data.ownerName);
    await this.fillSpecies(data.species);
    await this.fillRace(data.race);
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
   * Assert that the owner input is visible
   */
  async expectOwnerInputToBeVisible(): Promise<void> {
    await expect(this.ownerInput).toBeVisible();
  }

  /**
   * Assert that the image dropzone is visible
   */
  async expectImageDropzoneToBeVisible(): Promise<void> {
    await expect(this.imageDropzone).toBeVisible();
  }

  /**
   * Wait for the create page to load with form
   */
  async waitForCreatePageToLoad(): Promise<void> {
    await this.expectFormToBeVisible();
    await this.expectSubmitButtonToBeVisible();
  }
}
