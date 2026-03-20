import type { OfficePetType } from '@/services/office_pets/office_pets';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';
import type { UserType } from '@/services/users/users';
import PetVisitsTable from '@/components/visits/visits-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type PetDetailProps = {
  pet: OfficePetType;
  owner?: UserType;
  visits?: PetVisitType[];
};
export default function PetDetail({ pet, owner, visits }: PetDetailProps) {
  return (
    <div data-testid='pet-detail'>
      {pet.image_url && (
        <Avatar
          className='mr-auto ml-auto size-44'
          data-testid='pet-detail-avatar'
        >
          <AvatarImage src={pet.image_url} />
          <AvatarFallback>Pet Image</AvatarFallback>
        </Avatar>
      )}
      <div data-testid='pet-detail-id'>ID: {pet.id}</div>
      <div data-testid='pet-detail-name'>Name: {pet.name}</div>
      <div data-testid='pet-detail-species'>Species: {pet.species}</div>
      <div data-testid='pet-detail-race'>Race: {pet.race}</div>
      {owner && (
        <div data-testid='pet-detail-owner'>
          <div data-testid='pet-detail-owner-name'>
            Owner name: {owner.name}
          </div>
          <div data-testid='pet-detail-owner-id'>
            Owner ID: {owner.employee_id}
          </div>
        </div>
      )}
      {visits && visits.length > 0 && <PetVisitsTable visits={visits} />}
    </div>
  );
}
