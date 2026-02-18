import PetDetail from '@/components/pets/pet-detail';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getOfficePet } from '@/services/office_pets/office_pet';
import { getOfficePetOwner } from '@/services/office_pets/pet_owner';
import { getOfficePetVisits } from '@/services/office_pets/pet_visits';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

export default function PetDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id: number = Number(params.id);
  const pet_query = useQuery({
    queryKey: [`pet-detail-${id}`],
    queryFn: async () => getOfficePet(id, user),
  });
  const owner_query = useQuery({
    queryKey: [`pet-owner-${id}`],
    queryFn: async () => getOfficePetOwner(id, user),
  });
  const visits_query = useQuery({
    queryKey: [`pet-visits-${id}`],
    queryFn: async () => getOfficePetVisits(id, user),
  });
  const pet = pet_query.data;
  if (!pet) {
    return <></>;
  }
  return (
    <>
      <div>
        <h1>Details of a Pet</h1>
        <PetDetail
          pet={pet}
          owner={owner_query.data}
          visits={visits_query.data}
        ></PetDetail>
        <Link to={`/pets/${id}/update`}>
          <Button variant='outline'>Update pet</Button>
        </Link>
        <Link to={`/pets/${id}/delete`}>
          <Button variant='outline'>Delete this pet</Button>
        </Link>
      </div>
    </>
  );
}
