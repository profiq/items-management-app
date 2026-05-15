import { test as base } from '@playwright/test';
import { HomePage } from '../pages';

type PublicPageFixtures = {
  homePage: HomePage;
};

export const test = base.extend<PublicPageFixtures>({
  homePage: async ({ page }, provide) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await provide(homePage);
  },
});

export { expect } from '@playwright/test';
