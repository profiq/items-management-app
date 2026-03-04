import {
  TableRow,
  Table,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/table';
import type { OfficePetType } from '@/services/office_pets/office_pets';
import PetRow from './pet-row';

type PetTableRow = {
  pets: OfficePetType[];
};
function PetTable({ pets }: PetTableRow) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Species</TableHead>
          <TableHead>Race</TableHead>
          <TableHead>Image</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pets.map(pet => (
          <PetRow pet={pet} key={pet.id} />
        ))}
      </TableBody>
    </Table>
  );
}
export default PetTable;
