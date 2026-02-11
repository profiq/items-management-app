import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { faker } from '@faker-js/faker';
import PetRow from './pet-row';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import { MemoryRouter } from 'react-router';

describe('Testing pet row', () => {
  it('should show pet row', async () => {
    const id = faker.number.int();
    const name = faker.animal.petName();
    const species = faker.animal.bird();
    const race = faker.animal.bird();
    const pet: OfficePetType = { id, name, species, race };

    // table and tbody are here due to vitest complaining about <tr> being child of <div>
    const { getByText } = await render(
      <MemoryRouter>
        <table>
          <tbody>
            <PetRow pet={pet}></PetRow>
          </tbody>
        </table>
      </MemoryRouter>
    );
    expect(getByText(name)).toBeInTheDocument();
    expect(getByText(species)).toBeInTheDocument();
    expect(getByText(race)).toBeInTheDocument();
  });
});
