import EmployeeRow from '@/components/employee-row';
import { HoverInfo } from '@/components/hover-info';
import Paging from '@/components/paging';
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
import { useState } from 'react';
import { useSearchParams } from 'react-router';

function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxPerPage, setMaxPerPage] = useState<number>(25);

  const page = searchParams.get('page');
  if (!page) {
    setSearchParams({ page: '1' });
  }

  // use query Key for cache purposes
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['employees'],
    queryFn: async () => getEmployees(user),
  });

  const employees = query.data ?? [];

  const pageNumber = parseInt(page || '1') || 1;
  const maxPages = Math.ceil(employees.length / maxPerPage);
  if (pageNumber > maxPages) {
    setSearchParams({ page: maxPages.toString() });
  }

  return (
    <>
      {query.isLoading && <StatusSpinning data-testid='employees-loading' />}
      <div data-testid='employees-page'>
        <h1 data-testid='employees-title'>
          List of employees{' '}
          <HoverInfo
            text='This page uses Google Workspace API to list all the employees of the company.'
            iconSize={10}
            inline={true}
            readmeSection={{
              label: 'Google Workspace API',
              id: 'google-workspace-api',
            }}
            testId='employees-hover-info'
          />
        </h1>
        <Table data-testid='employees-table'>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Photo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-testid='employees-table-body'>
            {employees
              .slice(maxPerPage * (pageNumber - 1), maxPerPage * pageNumber)
              .map(EmployeeRow)}
          </TableBody>
        </Table>
        <Paging
          currentPage={pageNumber}
          setSearchParams={setSearchParams}
          maxPage={maxPages}
          setMaxPerPage={setMaxPerPage}
          buttonCount={5}
          testId='employees-paging'
        />
      </div>
    </>
  );
  //{query.data?.map((employee) => EmployeeRow(employee))}
}
export default Employees;
