import PetTable from '@/components/pets/pets-table';
import { StatusSpinning } from '@/components/status/status-spinning';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getOfficePets } from '@/services/office_pets/office_pets';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

export default function PetList() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['pet-list'],
    queryFn: async () => getOfficePets(user),
  });

  const pets = query.data ?? [];
  return (
    <>
      {query.isLoading && <StatusSpinning />}
      <div>
        <h1>List of pets</h1>
        <PetTable pets={pets} />
      </div>
      <Link to={`/create-pet`}>
        <Button className='cursor-pointer' variant='secondary'>
          Create a new pet
        </Button>
      </Link>
    </>
  );
}
