import PetTable from '@/components/pets/pets-table';
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
      <div>
        <h1>List of pets</h1>
        <PetTable pets={pets} />
      </div>
      <Link to={`/create-pet`}>
        <Button variant='outline'>Create a new pet</Button>
      </Link>
    </>
  );
}
