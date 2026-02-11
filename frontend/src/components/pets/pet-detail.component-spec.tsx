import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { faker } from '@faker-js/faker';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import PetDetail from './pet-detail';

describe('Testing pet detail', () => {
  it('should show pet detail', async () => {
    const id = faker.number.int();
    const name = faker.animal.petName();
    const species = faker.animal.bird();
    const race = faker.animal.bird();
    const pet: OfficePetType = { id, name, species, race };

    const { getByText } = await render(<PetDetail pet={pet}></PetDetail>);
    expect(getByText(`ID: ${id}`)).toBeInTheDocument();
    expect(getByText(`Name: ${name}`)).toBeInTheDocument();
    expect(getByText(`Species: ${species}`)).toBeInTheDocument();
    expect(getByText(`Race: ${race}`)).toBeInTheDocument();
  });
});
