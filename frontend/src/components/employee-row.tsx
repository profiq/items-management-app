import type { Employee } from '@/services/employees/employees';
import { TableCell, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

function EmployeeRow(employee: Employee) {
  // key={employee.id} is due to the fact that React does not react well to a
  // "list" made from map without key
  return (
    <TableRow key={employee.id}>
      <TableCell>{employee.id}</TableCell>
      <TableCell>{employee.name}</TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>
        <Avatar>
          <AvatarImage src={employee.photoUrl}></AvatarImage>
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </TableCell>
    </TableRow>
  );
}
export default EmployeeRow;
