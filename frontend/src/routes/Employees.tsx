import EmployeeRow from '@/components/employee-row';
import { StatusSpinning } from '@/components/status/status-spinning';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getEmployees } from '@/services/employees/employees';
import { useQuery } from '@tanstack/react-query';

function Employees() {
  // use query Key for cache purposes
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['employees'],
    queryFn: async () => getEmployees(user),
  });

  return (
    <>
      {query.isLoading && <StatusSpinning />}
      <div>
        <h1>List of employees</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Photo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{query.data?.map(EmployeeRow)}</TableBody>
        </Table>
      </div>
    </>
  );
  //{query.data?.map((employee) => EmployeeRow(employee))}
}
export default Employees;
