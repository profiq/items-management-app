import { useState } from 'react';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusSpinning } from '@/components/status/status-spinning';
import { toast } from 'sonner';
import { Button } from '@profiq/ui/components/ui/form';
import { Alert, AlertDescription } from '@profiq/ui/components/ui/feedback';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@profiq/ui/components/ui/layout';
import {
  getTables,
  getTableData,
  deleteTableItem,
  type TableInfo,
} from '@/services/admin/admin';
import type { User } from '@/lib/contexts.tsx';

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

  return (
    <div className='p-4'>
      <h1 className='text-3xl font-bold mb-6'>Admin Panel</h1>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-3'>Vyberte tabulku:</h2>
        {tablesQuery.isLoading && <StatusSpinning />}
        {tablesQuery.isError && (
          <Alert variant='destructive'>
            <AlertDescription>
              Chyba při načítání tabulek:{' '}
              {tablesQuery.error instanceof Error
                ? tablesQuery.error.message
                : 'Neznámá chyba'}
            </AlertDescription>
          </Alert>
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
          <h2 className='text-xl font-semibold mb-3'>{selectedTable.label}</h2>

          {dataQuery.isLoading && <StatusSpinning />}

          {dataQuery.isError && (
            <Alert variant='destructive'>
              <AlertDescription>
                Chyba při načítání dat:{' '}
                {dataQuery.error instanceof Error
                  ? dataQuery.error.message
                  : 'Neznámá chyba'}
              </AlertDescription>
            </Alert>
          )}

          {dataQuery.data && dataQuery.data.length > 0 && (
            <div className='overflow-x-auto border rounded-lg'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(dataQuery.data[0]).map(key => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                    <TableHead>Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataQuery.data.map((item, idx) => (
                    <TableRow key={idx}>
                      {Object.values(item).map((value, vidx) => (
                        <TableCell key={vidx}>
                          {typeof value === 'string' ||
                          typeof value === 'number'
                            ? String(value)
                            : JSON.stringify(value)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() =>
                            deleteMutation.mutate({
                              endpoint: selectedTable.endpoint,
                              id: item.id as number,
                            })
                          }
                          disabled={deleteMutation.isPending}
                        >
                          Smazat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {dataQuery.data && dataQuery.data.length === 0 && (
            <p className='text-gray-500'>Žádná data</p>
          )}
        </div>
      )}
    </div>
  );
}
