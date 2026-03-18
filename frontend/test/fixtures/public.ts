import { test as base } from '@playwright/test';
import { HomePage, AboutPage } from '../pages';

type PublicPageFixtures = {
  homePage: HomePage;
  aboutPage: AboutPage;
};

export const test = base.extend<PublicPageFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },
  aboutPage: async ({ page }, use) => {
    const aboutPage = new AboutPage(page);
    await aboutPage.navigate();
    await use(aboutPage);
  },
});

export { expect } from '@playwright/test';
