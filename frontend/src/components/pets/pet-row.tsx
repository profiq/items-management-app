import { TableCell, TableRow } from '@/components/ui/table';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import { Link } from 'react-router';

type PetRowProps = {
  pet: OfficePetType;
};
function PetRow({ pet }: PetRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Link to={{ pathname: `/pets/${pet.id}` }}>{pet.id}</Link>
      </TableCell>
      <TableCell>{pet.name}</TableCell>
      <TableCell>{pet.species}</TableCell>
      <TableCell>{pet.race}</TableCell>
    </TableRow>
  );
}
export default PetRow;
