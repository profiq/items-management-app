import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Profile page (protected route)
 */
export class ProfilePage extends BasePage {
  readonly pageUrl = '/profile';
  readonly pageTestId = 'profile-page';

  // Profile page locators
  get title() {
    return this.getByTestId('profile-title');
  }

  get subtitle() {
    return this.getByTestId('profile-subtitle');
  }

  get securityNote() {
    return this.getByTestId('profile-security-note');
  }

  // User info locators
  get userInfo() {
    return this.getByTestId('user-info');
  }

  get userEmail() {
    return this.getByTestId('user-email');
  }

  get userUid() {
    return this.getByTestId('user-uid');
  }

  get userName() {
    return this.getByTestId('user-name');
  }

  get userPhone() {
    return this.getByTestId('user-phone');
  }

  get userAvatarContainer() {
    return this.getByTestId('user-avatar-container');
  }

  get userAvatar() {
    return this.getByTestId('user-avatar');
  }

  /**
   * Get the title text
   */
  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  /**
   * Get the subtitle text
   */
  async getSubtitleText(): Promise<string> {
    return (await this.subtitle.textContent()) ?? '';
  }

  /**
   * Get the security note text
   */
  async getSecurityNoteText(): Promise<string> {
    return (await this.securityNote.textContent()) ?? '';
  }

  /**
   * Get the user email text
   */
  async getUserEmailText(): Promise<string> {
    return (await this.userEmail.textContent()) ?? '';
  }

  /**
   * Get the user UID text
   */
  async getUserUidText(): Promise<string> {
    return (await this.userUid.textContent()) ?? '';
  }

  /**
   * Get the user name text
   */
  async getUserNameText(): Promise<string> {
    return (await this.userName.textContent()) ?? '';
  }

  /**
   * Assert that the title is visible
   */
  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  /**
   * Assert that the subtitle is visible
   */
  async expectSubtitleToBeVisible(): Promise<void> {
    await expect(this.subtitle).toBeVisible();
  }

  /**
   * Assert that the security note is visible
   */
  async expectSecurityNoteToBeVisible(): Promise<void> {
    await expect(this.securityNote).toBeVisible();
  }

  /**
   * Assert that user info section is visible
   */
  async expectUserInfoToBeVisible(): Promise<void> {
    await expect(this.userInfo).toBeVisible();
  }

  /**
   * Assert that user email is visible and contains expected email
   */
  async expectUserEmailToContain(email: string): Promise<void> {
    await expect(this.userEmail).toBeVisible();
    await expect(this.userEmail).toContainText(email);
  }

  /**
   * Assert that user name is visible and contains expected name
   */
  async expectUserNameToContain(name: string): Promise<void> {
    await expect(this.userName).toBeVisible();
    await expect(this.userName).toContainText(name);
  }
}
