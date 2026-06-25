import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { dataSource } from '../datasource';
import { City } from '../cities/entities/city.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Item } from '../items/entities/item.entity';
import {
  ItemCopy,
  ItemCondition,
} from '../item-copies/entities/item-copy.entity';

// Deterministic data so repeated runs / environments produce the same set.
faker.seed(20240601);

const CITY_NAMES = ['Praha', 'Brno', 'Ostrava', 'Plzeň'];

const CATEGORY_NAMES = [
  'Electronics',
  'Books',
  'Tools',
  'Office',
  'Sports',
  'Furniture',
];

const TAG_NAMES = [
  'fragile',
  'heavy',
  'portable',
  'new',
  'refurbished',
  'shared',
  'high-demand',
];

const CONDITIONS = [
  ItemCondition.Good,
  ItemCondition.Good,
  ItemCondition.Good,
  ItemCondition.Damaged,
  ItemCondition.Lost,
];

/** Look up an existing row by a unique column, otherwise create it. */
async function upsert<T extends object>(
  ds: DataSource,
  entity: new () => T,
  where: Partial<T>,
  data: Partial<T>
): Promise<T> {
  const repo = ds.getRepository(entity);
  const existing = await repo.findOne({ where: where as never });
  if (existing) {
    return existing;
  }
  const created = repo.create({ ...where, ...data } as never) as T;
  return repo.save(created as never) as Promise<T>;
}

export async function seed(ds: DataSource): Promise<void> {
  const force =
    process.argv.includes('--force') || process.env.SEED_FORCE === 'true';

  const cityRepo = ds.getRepository(City);
  const existingCities = await cityRepo.count();
  if (existingCities > 0 && !force) {
    console.log(
      `Database already contains ${existingCities} cities. Skipping seed. ` +
        `Pass --force (or SEED_FORCE=true) to seed anyway.`
    );
    return;
  }

  console.log('Seeding cities and locations...');
  const locations: Location[] = [];
  for (const name of CITY_NAMES) {
    const city = await upsert(ds, City, { name }, { archived_at: null });
    for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
      const locName = `${name} - ${faker.location.street()}`;
      const location = await upsert(
        ds,
        Location,
        { name: locName },
        { city_id: city.id, archived_at: null }
      );
      locations.push(location);
    }
  }

  console.log('Seeding categories...');
  const categories: Category[] = [];
  for (const name of CATEGORY_NAMES) {
    categories.push(
      await upsert(ds, Category, { name }, { archived_at: null })
    );
  }

  console.log('Seeding tags...');
  const tags: Tag[] = [];
  for (const name of TAG_NAMES) {
    tags.push(await upsert(ds, Tag, { name }, {}));
  }

  console.log('Seeding items and copies...');
  const itemRepo = ds.getRepository(Item);
  const copyRepo = ds.getRepository(ItemCopy);
  let copyCountTotal = 0;
  for (let i = 0; i < 25; i++) {
    const item = itemRepo.create({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      image_url: null,
      default_loan_days: faker.helpers.arrayElement([7, 14, 30]),
      archived_at: null,
      categories: faker.helpers.arrayElements(
        categories,
        faker.number.int({ min: 1, max: 3 })
      ),
      tags: faker.helpers.arrayElements(
        tags,
        faker.number.int({ min: 0, max: 3 })
      ),
    });
    const savedItem = await itemRepo.save(item);

    const copyCount = faker.number.int({ min: 1, max: 4 });
    for (let c = 0; c < copyCount; c++) {
      const copy = copyRepo.create({
        item_id: savedItem.id,
        location_id: faker.helpers.arrayElement(locations).id,
        condition: faker.helpers.arrayElement(CONDITIONS),
        archived_at: null,
      });
      await copyRepo.save(copy);
      copyCountTotal++;
    }
  }

  console.log('Seed complete:');
  console.log(`  cities:     ${await cityRepo.count()}`);
  console.log(`  locations:  ${await ds.getRepository(Location).count()}`);
  console.log(`  categories: ${await ds.getRepository(Category).count()}`);
  console.log(`  tags:       ${await ds.getRepository(Tag).count()}`);
  console.log(`  items:      ${await itemRepo.count()}`);
  console.log(`  copies:     ${copyCountTotal}`);
}

async function main(): Promise<void> {
  await dataSource.initialize();
  try {
    await seed(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  });
}
