import { TableCell, TableRow } from '@/components/ui/table';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';

type PetVisitRowProps = {
  visit: PetVisitType;
};

export default function PetVisitRow({ visit }: PetVisitRowProps) {
  return (
    <TableRow>
      <TableCell>{visit.id}</TableCell>
      <TableCell>{visit.date}</TableCell>
    </TableRow>
  );
}
