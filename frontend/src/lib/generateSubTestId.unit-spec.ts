import { describe, expect, it } from 'vitest';
import { generateSubTestId } from './generateSubTestId';
import { faker } from '@faker-js/faker';

describe('Testing generating sub test IDs', () => {
  it('should return valid subids', () => {
    const root_id = faker.string.alphanumeric({ length: { min: 5, max: 20 } });
    const suffix_number = faker.string.numeric();
    expect(generateSubTestId(root_id, suffix_number)).toStrictEqual(
      `${root_id}-${suffix_number}`
    );
    const suffix_lower = faker.string.alpha({ casing: 'lower' });
    expect(generateSubTestId(root_id, suffix_lower)).toStrictEqual(
      `${root_id}-${suffix_lower}`
    );
    const suffix_random = faker.string.alphanumeric({
      length: { min: 5, max: 20 },
    });
    expect(generateSubTestId(root_id, suffix_random)).toStrictEqual(
      `${root_id}-${suffix_random}`
    );
  });
  it('should return undefined', () => {
    const root_id = faker.string.alphanumeric({ length: { min: 5, max: 20 } });
    expect(generateSubTestId('', '')).toBeUndefined();
    expect(generateSubTestId(root_id, '')).toBeUndefined();
    expect(generateSubTestId('', '1')).toBeUndefined();
  });
});
