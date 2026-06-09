import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Alert, Avatar, Pagination, Table, Text } from '@profiq/ui';
import { AdminBackButton } from '@/components/AdminBackButton';
import { HoverInfo } from '@/components/hover-info';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { getEmployees, type Employee } from '@/services/employees/employees';

const PAGE_SIZE = 20;

function Employees() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees(user),
  });

  const employees = employeesQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const paginatedEmployees = employees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'photo',
        header: 'Photo',
        cell: ({ row }) => (
          <Avatar
            isGroup={false}
            item={{
              id: row.original.id,
              imgSource: row.original.photoUrl,
              imgAlt: row.original.name,
              size: 'sm',
            }}
            fallback={row.original.name?.[0] ?? '?'}
          />
        ),
      },
    ],
    []
  );

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <AdminBackButton />
      <div className='flex flex-col gap-1'>
        <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
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
        </Text>
        <Text as='p' size='sm' className='text-muted-foreground'>
          Total: {employees.length}
        </Text>
      </div>

      {employeesQuery.isLoading && (
        <StatusSpinning data-testid='employees-loading' />
      )}

      {employeesQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load employees'
          description={employeesQuery.error?.message ?? 'Unknown error'}
        />
      )}

      {employeesQuery.data && (
        <>
          <div className='overflow-x-auto rounded-lg border'>
            <Table
              columns={columns}
              data={paginatedEmployees}
              dataTestId='employees-table'
            />
          </div>
          {totalPages > 1 && (
            <div className='flex justify-end'>
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
                dataTestId='employees-pagination'
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Employees;
