import {
  TableRow,
  Table,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/table';
import PetVisitRow from './visits-row';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';

type PetVisitTableProps = {
  visits: PetVisitType[];
};

export default function PetVisitsTable({ visits }: PetVisitTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map(visit => (
          <PetVisitRow visit={visit} key={visit.id} />
        ))}
      </TableBody>
    </Table>
  );
}
