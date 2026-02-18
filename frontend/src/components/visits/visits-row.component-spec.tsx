import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { faker } from '@faker-js/faker';
import PetVisitRow from './visits-row';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';

describe('Testing pet visit row', () => {
  it('should show pet visit row', async () => {
    const id = faker.number.int();
    const date = faker.date.anytime().toISOString();
    const visit: PetVisitType = { id, date };

    // table and tbody are here due to vitest complaining about <tr> being child of <div>
    const { getByText } = await render(
      <table>
        <tbody>
          <PetVisitRow visit={visit} />
        </tbody>
      </table>
    );
    expect(getByText(`${id}`)).toBeInTheDocument();
    expect(getByText(date)).toBeInTheDocument();
  });
});
