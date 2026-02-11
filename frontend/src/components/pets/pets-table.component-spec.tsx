import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { faker } from '@faker-js/faker';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import PetTable from './pets-table';
import { MemoryRouter } from 'react-router';

describe('Testing pet table', () => {
  it('should show pet table with data', async () => {
    const id = faker.number.int();
    const name = faker.animal.petName();
    const species = faker.animal.bird();
    const race = faker.animal.bird();
    const pet: OfficePetType = { id, name, species, race };
    const pets: OfficePetType[] = [pet];

    const { getByText } = await render(
      <MemoryRouter>
        <PetTable pets={pets}></PetTable>
      </MemoryRouter>
    );
    expect(getByText(pet.name)).toBeInTheDocument();
    expect(getByText(pet.species)).toBeInTheDocument();
    expect(getByText(pet.race)).toBeInTheDocument();
  });
});
