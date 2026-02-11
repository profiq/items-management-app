import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { deletePet } from '@/services/office_pets/delete_pet';
import { getOfficePet } from '@/services/office_pets/office_pet';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router';

export default function PetDeletePage() {
  const { user } = useAuth();
  const params = useParams();
  const id: number = Number(params.id);
  const mutation = useMutation({
    mutationKey: [`pet-delete`],
    mutationFn: async () => deletePet(id, user),
  });
  const query = useQuery({
    queryKey: [`pet-detail-${id}`],
    queryFn: async () => getOfficePet(id, user),
  });
  if (mutation.isSuccess) {
    return <Navigate to={`/pets`} />;
  }
  const pet = query.data;
  if (!pet) {
    return <></>;
  }
  return (
    <>
      <div>
        <h1>
          Delete Pet {pet.name} ({pet.id})
        </h1>
        <div>Are you sure you want to delete this pet?</div>
        <Button variant='outline' onClick={() => mutation.mutate()}>
          Delete the pet
        </Button>
      </div>
    </>
  );
}
