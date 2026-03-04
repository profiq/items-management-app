import { StatusSpinning } from '@/components/status/status-spinning';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { deletePet } from '@/services/office_pets/delete_pet';
import { getOfficePet } from '@/services/office_pets/office_pet';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

export default function PetDeletePage() {
  const { user } = useAuth();
  const params = useParams();
  const id: number = Number(params.id);
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationKey: [`pet-delete`],
    mutationFn: async () => deletePet(id, user),
    onSuccess: () => {
      toast.success('Successfully deleted the pet');
      navigate(`/pets`);
    },
    onError: error => {
      toast.error(`An error occurred while deleting the pet: ${error.message}`);
    },
  });
  const query = useQuery({
    queryKey: [`pet-detail-${id}`],
    queryFn: async () => getOfficePet(id, user),
  });

  if (query.isError) {
    toast(`${query.error}`);
  }

  const pet = query.data;
  if (!pet) {
    return <>{query.isLoading && <StatusSpinning />}</>;
  }
  return (
    <>
      {query.isLoading && <StatusSpinning />}
      {mutation.isPending && <StatusSpinning />}
      <div>
        <h1>
          Delete Pet {pet.name} ({pet.id})
        </h1>
        <div>Are you sure you want to delete this pet?</div>
        <Button
          className='cursor-pointer mt-3'
          variant='destructive'
          onClick={() => mutation.mutate()}
        >
          Delete the pet
        </Button>
      </div>
    </>
  );
}
