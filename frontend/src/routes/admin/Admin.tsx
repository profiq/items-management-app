import { useState } from 'react';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { StatusSpinning } from '@/components/status/status-spinning';
import { toast } from 'sonner';
import { Alert, Button, Table, Text } from '@profiq/ui';
import {
  getTables,
  getTableData,
  deleteTableItem,
  type TableInfo,
} from '@/services/admin/admin';
import type { User } from '@/lib/contexts.tsx';

type AdminTableRow = Record<string, unknown>;

const formatCellValue = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return JSON.stringify(value);
};

const createColumns = (
  row: AdminTableRow,
  onDelete: (item: AdminTableRow) => void,
  isDeleting: boolean
): ColumnDef<AdminTableRow>[] => [
  ...Object.keys(row).map(
    (key): ColumnDef<AdminTableRow> => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => formatCellValue(getValue()),
    })
  ),
  {
    id: 'actions',
    header: 'Akce',
    cell: ({ row: tableRow }) => (
      <Button
        variant='destructive'
        size='sm'
        onClick={() => onDelete(tableRow.original)}
        disabled={isDeleting}
      >
        Smazat
      </Button>
    ),
  },
];

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  const tablesQuery = useQuery({
    queryKey: ['admin-tables'],
    queryFn: () => getTables(user as User),
  });

  const dataQuery = useQuery({
    queryKey: ['admin-data', selectedTable?.endpoint],
    queryFn: () => getTableData(user as User, selectedTable!.endpoint),
    enabled: !!selectedTable,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ endpoint, id }: { endpoint: string; id: number }) =>
      deleteTableItem(user as User, endpoint, id),
    onSuccess: () => {
      if (selectedTable) {
        queryClient.invalidateQueries({
          queryKey: ['admin-data', selectedTable.endpoint],
        });
        toast.success('Položka smazána');
      }
    },
    onError: (error: Error) => {
      toast.error(`Chyba: ${error.message}`);
    },
  });

  const tableColumns =
    dataQuery.data && dataQuery.data.length > 0
      ? createColumns(
          dataQuery.data[0],
          item =>
            deleteMutation.mutate({
              endpoint: selectedTable!.endpoint,
              id: item.id as number,
            }),
          deleteMutation.isPending
        )
      : [];

  return (
    <div className='p-4'>
      <Text as='h1' size='2xl' weight='bold' className='mb-6'>
        Admin Panel
      </Text>

      <div className='mb-6'>
        <Text as='h2' size='xl' weight='semibold' className='mb-3'>
          Vyberte tabulku:
        </Text>
        {tablesQuery.isLoading && <StatusSpinning />}
        {tablesQuery.isError && (
          <Alert
            variant='destructive'
            description={
              <>
                Chyba při načítání tabulek:{' '}
                {tablesQuery.error instanceof Error
                  ? tablesQuery.error.message
                  : 'Neznámá chyba'}
              </>
            }
          />
        )}
        {tablesQuery.data && (
          <div className='grid grid-cols-2 gap-2'>
            {tablesQuery.data.map(table => (
              <Button
                key={table.name}
                variant={
                  selectedTable?.name === table.name ? 'default' : 'outline'
                }
                onClick={() => setSelectedTable(table)}
                className='justify-start'
              >
                {table.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {selectedTable && (
        <div>
          <Text as='h2' size='xl' weight='semibold' className='mb-3'>
            {selectedTable.label}
          </Text>

          {dataQuery.isLoading && <StatusSpinning />}

          {dataQuery.isError && (
            <Alert
              variant='destructive'
              description={
                <>
                  Chyba při načítání dat:{' '}
                  {dataQuery.error instanceof Error
                    ? dataQuery.error.message
                    : 'Neznámá chyba'}
                </>
              }
            />
          )}

          {dataQuery.data && dataQuery.data.length > 0 && (
            <div className='overflow-x-auto border rounded-lg'>
              <Table columns={tableColumns} data={dataQuery.data} />
            </div>
          )}

          {dataQuery.data && dataQuery.data.length === 0 && (
            <Text as='p' size='sm' className='text-gray-500'>
              Žádná data
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
