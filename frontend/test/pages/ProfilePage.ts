import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Profile page (protected route)
 */
export class ProfilePage extends BasePage {
  readonly pageUrl = '/profile';
  readonly pageTestId = 'profile-page';

  get title() {
    return this.getByTestId('profile-title');
  }

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

  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }

  async getUserEmailText(): Promise<string> {
    return (await this.userEmail.textContent()) ?? '';
  }

  async getUserUidText(): Promise<string> {
    return (await this.userUid.textContent()) ?? '';
  }

  async getUserNameText(): Promise<string> {
    return (await this.userName.textContent()) ?? '';
  }

  async expectTitleToBeVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  async expectUserInfoToBeVisible(): Promise<void> {
    await expect(this.userInfo).toBeVisible();
  }

  async expectUserEmailToContain(email: string): Promise<void> {
    await expect(this.userEmail).toBeVisible();
    await expect(this.userEmail).toContainText(email);
  }

  async expectUserNameToContain(name: string): Promise<void> {
    await expect(this.userName).toBeVisible();
    await expect(this.userName).toContainText(name);
  }
}
