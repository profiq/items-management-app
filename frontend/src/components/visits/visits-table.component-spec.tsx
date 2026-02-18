import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { faker } from '@faker-js/faker';
import PetVisitsTable from './visits-table';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';

describe('Testing pet table', () => {
  it('should show pet table with data', async () => {
    const id = faker.number.int();
    const date = faker.date.anytime().toISOString();
    const visit: PetVisitType = { id, date };
    const visits: PetVisitType[] = [visit];

    const { getByText } = await render(<PetVisitsTable visits={visits} />);
    expect(getByText(`${visit.id}`)).toBeInTheDocument();
    expect(getByText(visit.date)).toBeInTheDocument();
  });
});
