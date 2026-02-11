import { TableCell, TableRow } from '@/components/ui/table';
import type { OfficePetType } from '@/services/office_pets/office_pets';

type PetRowProps = {
  pet: OfficePetType;
};
function PetRow({ pet }: PetRowProps) {
  // key={pet.id} is due to the fact that React does not react well to a
  // "list" made from map without key
  return (
    <TableRow>
      <TableCell>{pet.id}</TableCell>
      <TableCell>{pet.name}</TableCell>
      <TableCell>{pet.species}</TableCell>
      <TableCell>{pet.race}</TableCell>
    </TableRow>
  );
}
export default PetRow;
