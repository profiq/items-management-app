import { type Page } from '@playwright/test';
import { PetListPage } from '../pages';

export async function getFirstPetId(
  authenticatedPage: Page
): Promise<string | null> {
  const petListPage = new PetListPage(authenticatedPage);
  await petListPage.navigate();
  await petListPage.waitForPetsToLoad();

  const petCount = await petListPage.getPetCount();
  if (petCount === 0) {
    return null;
  }

  const firstPetLink = petListPage.getPetRows().first().locator('a').first();
  const href = await firstPetLink.getAttribute('href');
  const match = href?.match(/\/pets\/(\d+)/);
  return match ? match[1] : null;
}
