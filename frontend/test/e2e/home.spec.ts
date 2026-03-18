import { test, expect } from '../fixtures/public';

test.describe('Home Page', () => {
  test('should load the home page', async ({ homePage }) => {
    await homePage.expectPageToBeVisible();
  });

  test('should display the correct title', async ({ homePage }) => {
    await homePage.expectTitleToBeVisible();
    const titleText = await homePage.getTitleText();
    expect(titleText).toBe('Reference website for Profiq.com');
  });

  test('should display the welcome message', async ({ homePage }) => {
    await homePage.expectWelcomeMessageToBeVisible();
  });

  test('should display the main card', async ({ homePage }) => {
    await homePage.expectCardToBeVisible();
  });

  test('should display the status message', async ({ homePage }) => {
    await homePage.expectStatusMessageToBeVisible();
  });

  test('should have correct URL', async ({ homePage }) => {
    const url = await homePage.getCurrentUrl();
    expect(url).toContain('/');
  });

  test('should have correct page title', async ({ homePage }) => {
    const pageTitle = await homePage.getPageTitle();
    expect(pageTitle).toBe('Profiq Reference App');
  });
});
