import { HoverInfo } from '@/components/hover-info';
import Paging from '@/components/paging';
import PetTable from '@/components/pets/pets-table';
import { StatusSpinning } from '@/components/status/status-spinning';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getOfficePets } from '@/services/office_pets/office_pets';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

export default function PetList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxPerPage, setMaxPerPage] = useState<number>(25);
  const page = searchParams.get('page');

  useEffect(() => {
    if (!page) {
      setSearchParams({ page: '1' });
    }
  }, [page, setSearchParams]);

  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['pet-list'],
    queryFn: async () => getOfficePets(user),
  });

  const pets = query.data ?? [];

  const pageNumber = parseInt(page || '1') || 1;
  const maxPages = Math.ceil(pets.length / maxPerPage);
  if (pageNumber > maxPages && maxPages > 0) {
    setSearchParams({ page: maxPages.toString() });
  }

  return (
    <div data-testid='pet-list-page'>
      {query.isLoading && <StatusSpinning />}
      <div>
        <h1 data-testid='pet-list-title'>
          List of pets{' '}
          <HoverInfo
            iconSize={10}
            text='This pet list uses the database on the backend.'
            readmeSection={{ label: 'Database', id: 'database' }}
            inline={true}
          />
        </h1>
        <PetTable
          pets={pets.slice(
            maxPerPage * (pageNumber - 1),
            maxPerPage * pageNumber
          )}
        />
      </div>
      <Link to={`/create-pet`}>
        <Button
          className='cursor-pointer mt-3'
          variant='secondary'
          data-testid='pet-list-create-button'
        >
          Create a new pet
        </Button>
      </Link>
      <Paging
        currentPage={pageNumber}
        setSearchParams={setSearchParams}
        maxPage={maxPages}
        setMaxPerPage={setMaxPerPage}
      />
    </div>
  );
}
