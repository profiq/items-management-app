import { test, expect } from '../fixtures/public';

test.describe('Home Page', () => {
  test('should load the home page', async ({ homePage }) => {
    await homePage.expectPageToBeVisible();
  });

  test('should have correct URL', async ({ homePage }) => {
    const url = await homePage.getCurrentUrl();
    expect(url).toContain('/');
  });

  test('should have correct page title', async ({ homePage }) => {
    const pageTitle = await homePage.getPageTitle();
    expect(pageTitle).toBe('Items Management App');
  });
});
