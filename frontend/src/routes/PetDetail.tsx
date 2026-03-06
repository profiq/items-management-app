import PetDetail from '@/components/pets/pet-detail';
import { StatusSpinning } from '@/components/status/status-spinning';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getOfficePet } from '@/services/office_pets/office_pet';
import { getOfficePetOwner } from '@/services/office_pets/pet_owner';
import { getOfficePetVisits } from '@/services/office_pets/pet_visits';
import {
  createVisit,
  type VisitCreateType,
} from '@/services/pet_visits/create_visit';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';

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

  const visit_mutation = useMutation({
    mutationKey: [`pet-detail-${id}`],
    mutationFn: async () => {
      const data: VisitCreateType = {
        pet_id: id,
        date: new Date(),
      };
      await createVisit(data, user);
    },
    onSuccess: () => {
      toast.success('Successfully added a pet visit', {
        position: 'bottom-right',
      });

      visits_query.refetch();
    },
    onError: error => {
      toast.error(`Could add a pet visit: ${error.message}`, {
        position: 'bottom-right',
      });
    },
  });

  // I do not check owner or visits, because they are optional
  if (pet_query.isError) {
    toast(`${pet_query.error}`);
  }

  const pet = pet_query.data;
  if (!pet) {
    return <>{pet_query.isLoading && <StatusSpinning />}</>;
  }
  return (
    <>
      {pet_query.isLoading && <StatusSpinning />}
      <div>
        <h1>Details of a Pet</h1>
        <PetDetail
          pet={pet}
          owner={owner_query.data}
          visits={visits_query.data}
        ></PetDetail>
        <div className='mt-3'>
          <Button
            className='cursor-pointer'
            variant='default'
            onClick={() => visit_mutation.mutate()}
          >
            Create pet visit
          </Button>
        </div>
        <div className='mt-3'>
          <Link to={`/pets/${id}/update`}>
            <Button className='cursor-pointer mx-1' variant='outline'>
              Update pet
            </Button>
          </Link>
          <Link to={`/pets/${id}/delete`}>
            <Button className='cursor-pointer mx-1' variant='destructive'>
              Delete this pet
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
