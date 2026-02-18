import type { OfficePetType } from '@/services/office_pets/office_pets';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';
import type { UserType } from '@/services/users/users';
import PetVisitsTable from '@/components/visits/visits-table';

type PetDetailProps = {
  pet: OfficePetType;
  owner?: UserType;
  visits?: PetVisitType[];
};
export default function PetDetail({ pet, owner, visits }: PetDetailProps) {
  return (
    <>
      <div>ID: {pet.id}</div>
      <div>Name: {pet.name}</div>
      <div>Species: {pet.species}</div>
      <div>Race: {pet.race}</div>
      {owner && (
        <>
          <div>Owner name: {owner.name}</div>
          <div>Owner ID: {owner.employee_id}</div>
        </>
      )}
      {visits && visits.length > 0 && <PetVisitsTable visits={visits} />}
    </>
  );
}
