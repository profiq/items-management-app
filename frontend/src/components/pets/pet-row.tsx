import { TableCell, TableRow } from '@/components/ui/table';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      {pet.image_url && (
        <TableCell>
          <Avatar>
            <AvatarImage src={pet.image_url} />
            <AvatarFallback>Pet image</AvatarFallback>
          </Avatar>
        </TableCell>
      )}
    </TableRow>
  );
}
export default PetRow;
