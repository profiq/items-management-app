import PetDetail from '@/components/pets/pet-detail';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getOfficePet } from '@/services/office_pets/office_pet';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

export default function PetDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id: number = Number(params.id);
  const query = useQuery({
    queryKey: [`pet-detail-${id}`],
    queryFn: async () => getOfficePet(id, user),
  });
  const pet = query.data;
  if (!pet) {
    return <></>;
  }
  return (
    <>
      <div>
        <h1>Details of a Pet</h1>
        <PetDetail pet={pet}></PetDetail>
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
