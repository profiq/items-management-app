import { TableCell, TableRow } from '@/components/ui/table';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type PetRowProps = {
  pet: OfficePetType;
};
function PetRow({ pet }: PetRowProps) {
  return (
    <TableRow data-testid={`pet-row-${pet.id}`}>
      <TableCell data-testid={`pet-row-${pet.id}-id`}>
        <Link to={{ pathname: `/pets/${pet.id}` }}>{pet.id}</Link>
      </TableCell>
      <TableCell data-testid={`pet-row-${pet.id}-name`}>{pet.name}</TableCell>
      <TableCell data-testid={`pet-row-${pet.id}-species`}>
        {pet.species}
      </TableCell>
      <TableCell data-testid={`pet-row-${pet.id}-race`}>{pet.race}</TableCell>
      {pet.image_url && (
        <TableCell data-testid={`pet-row-${pet.id}-image`}>
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
