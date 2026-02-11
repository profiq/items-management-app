import type { OfficePetType } from '@/services/office_pets/office_pets';

type PetDetailProps = {
  pet: OfficePetType;
};
export default function PetDetail({ pet }: PetDetailProps) {
  return (
    <>
      <div>ID: {pet.id}</div>
      <div>Name: {pet.name}</div>
      <div>Species: {pet.species}</div>
      <div>Race: {pet.race}</div>
    </>
  );
}
