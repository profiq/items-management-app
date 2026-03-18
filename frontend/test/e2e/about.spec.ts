import { test, expect } from '../fixtures/public';

test.describe('About Page', () => {
  test('should load the about page', async ({ aboutPage }) => {
    await aboutPage.expectPageToBeVisible();
  });

  test('should display the correct title', async ({ aboutPage }) => {
    await aboutPage.expectTitleToBeVisible();
    const titleText = await aboutPage.getTitleText();
    expect(titleText).toBe('Reference website');
  });

  test('should display the description', async ({ aboutPage }) => {
    await aboutPage.expectDescriptionToBeVisible();
    const description = await aboutPage.getDescriptionText();
    expect(description).toContain('This is a reference website');
    expect(description).toContain('Student Pool');
  });

  test('should display the tech info section', async ({ aboutPage }) => {
    await aboutPage.expectTechInfoToBeVisible();
  });

  test('should display the React logo', async ({ aboutPage }) => {
    await aboutPage.expectReactLogoToBeVisible();
  });

  test('should have correct URL', async ({ aboutPage }) => {
    const url = await aboutPage.getCurrentUrl();
    expect(url).toContain('/about');
  });

  test('should have correct page title', async ({ aboutPage }) => {
    const pageTitle = await aboutPage.getPageTitle();
    expect(pageTitle).toBe('Profiq Reference App');
  });
});
