import type { Employee } from '@/services/employees/employees';
import { TableCell, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

function EmployeeRow(employee: Employee) {
  // key={employee.id} is due to the fact that React does not react well to a
  // "list" made from map without key
  return (
    <TableRow key={employee.id} data-testid={`employee-row-${employee.id}`}>
      <TableCell data-testid='employee-id'>{employee.id}</TableCell>
      <TableCell data-testid='employee-name'>{employee.name}</TableCell>
      <TableCell data-testid='employee-email'>{employee.email}</TableCell>
      <TableCell data-testid='employee-photo'>
        <Avatar>
          <AvatarImage src={employee.photoUrl}></AvatarImage>
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </TableCell>
    </TableRow>
  );
}
export default EmployeeRow;
