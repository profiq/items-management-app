import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Alert,
  AlertDialog,
  Badge,
  Button,
  Dialog,
  InputField,
  Pagination,
  Table,
  Tabs,
  Text,
} from '@profiq/ui';
import type { TabItem } from '@profiq/ui';
import { AdminBackButton } from '@/components/AdminBackButton';
import { StatusSpinning } from '@/components/status/status-spinning';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  extendAdminLoan,
  getAdminLoans,
  returnAdminLoan,
  type AdminLoan,
  type LoanStatus,
} from '@/services/admin/loans';

const PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function deriveLoanStatus(loan: AdminLoan): LoanStatus {
  if (loan.returned_at !== null) return 'returned';
  const today = new Date().toISOString().split('T')[0];
  if (loan.due_date < today) return 'overdue';
  return 'active';
}

function LoanStatusBadge({ loan }: { loan: AdminLoan }) {
  const status = deriveLoanStatus(loan);
  if (status === 'returned')
    return <Badge variant='secondary' title='Returned' isRounded />;
  if (status === 'overdue')
    return <Badge variant='destructive' title='Overdue' isRounded />;
  return <Badge variant='outline' title='Active' isRounded />;
}

function LoansTableContent({ status }: { status?: LoanStatus }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [loanToReturn, setLoanToReturn] = useState<AdminLoan | null>(null);
  const [loanToExtend, setLoanToExtend] = useState<AdminLoan | null>(null);
  const [extendDays, setExtendDays] = useState(7);

  const loansQuery = useQuery({
    queryKey: ['admin-loans', status],
    queryFn: () => getAdminLoans(user as User, status),
  });

  const returnMutation = useMutation({
    mutationFn: (id: number) => returnAdminLoan(user as User, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      setLoanToReturn(null);
      setPage(1);
      toast.success('Loan returned');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const extendMutation = useMutation({
    mutationFn: ({ id, days }: { id: number; days: number }) =>
      extendAdminLoan(user as User, id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      setLoanToExtend(null);
      setPage(1);
      toast.success('Loan extended');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isPending = returnMutation.isPending || extendMutation.isPending;

  const columns = useMemo<ColumnDef<AdminLoan>[]>(
    () => [
      {
        id: 'user',
        header: 'User',
        cell: ({ row }) => row.original.user.name,
      },
      {
        id: 'item',
        header: 'Item',
        cell: ({ row }) => row.original.copy.item.name,
      },
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => row.original.copy.location.name,
      },
      {
        id: 'borrowed_at',
        header: 'Borrowed',
        cell: ({ row }) => formatDate(row.original.borrowed_at),
      },
      {
        id: 'due_date',
        header: 'Due',
        cell: ({ row }) => formatDate(row.original.due_date),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <LoanStatusBadge loan={row.original} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const loan = row.original;
          if (loan.returned_at !== null) return null;
          return (
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isPending}
                onClick={() => setLoanToReturn(loan)}
              >
                <RotateCcw aria-hidden='true' />
                Return
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isPending}
                onClick={() => {
                  setExtendDays(7);
                  setLoanToExtend(loan);
                }}
              >
                <Clock aria-hidden='true' />
                Extend
              </Button>
            </div>
          );
        },
      },
    ],
    [isPending]
  );

  const allLoans = loansQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(allLoans.length / PAGE_SIZE));
  const paginatedLoans = allLoans.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <section className='flex flex-col gap-6'>
      <Text as='p' size='sm' className='text-muted-foreground'>
        Total: {allLoans.length}
      </Text>

      {loansQuery.isLoading && <StatusSpinning />}

      {loansQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load loans'
          description={
            loansQuery.error instanceof Error
              ? loansQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {loansQuery.data && (
        <>
          <div className='overflow-x-auto rounded-lg border'>
            <Table
              columns={columns}
              data={paginatedLoans}
              dataTestId='admin-loans-table'
            />
          </div>
          {totalPages > 1 && (
            <div className='flex justify-end'>
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
                dataTestId='admin-loans-pagination'
              />
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={loanToReturn !== null}
        onOpenChange={open => {
          if (!open) setLoanToReturn(null);
        }}
        title='Return loan'
        description={
          loanToReturn
            ? `Return "${loanToReturn.copy.item.name}" borrowed by ${loanToReturn.user.name}?`
            : ''
        }
        actionLabel={returnMutation.isPending ? 'Returning...' : 'Return'}
        cancelLabel='Cancel'
        onAction={() => {
          if (loanToReturn) returnMutation.mutate(loanToReturn.id);
        }}
      />

      <Dialog
        open={loanToExtend !== null}
        onOpenChange={open => {
          if (!open) setLoanToExtend(null);
        }}
        title={<span className='text-foreground'>Extend loan</span>}
        description={
          loanToExtend
            ? `Extend "${loanToExtend.copy.item.name}" borrowed by ${loanToExtend.user.name}`
            : ''
        }
        className='text-card-foreground'
        footer={
          <>
            <Button
              type='button'
              variant='outline'
              onClick={() => setLoanToExtend(null)}
              disabled={extendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='admin-loan-extend-form'
              disabled={extendMutation.isPending}
            >
              {extendMutation.isPending ? 'Extending...' : 'Extend'}
            </Button>
          </>
        }
      >
        <form
          id='admin-loan-extend-form'
          onSubmit={e => {
            e.preventDefault();
            if (loanToExtend && extendDays >= 1) {
              extendMutation.mutate({ id: loanToExtend.id, days: extendDays });
            }
          }}
          className='flex flex-col gap-4'
        >
          <InputField
            fieldLabel='Number of days'
            fieldPlaceholder='Enter number of days'
            fieldDescription=''
            type='number'
            value={String(extendDays)}
            onChange={value => {
              const parsed = parseInt(value, 10);
              setExtendDays(parsed > 0 ? parsed : 1);
            }}
            isRequired
            isDisabled={extendMutation.isPending}
          />
        </form>
      </Dialog>
    </section>
  );
}

export default function AdminLoans() {
  const tabs: TabItem[] = [
    { value: 'all', label: 'All', content: <LoansTableContent /> },
    {
      value: 'active',
      label: 'Active',
      content: <LoansTableContent status='active' />,
    },
    {
      value: 'overdue',
      label: 'Overdue',
      content: <LoansTableContent status='overdue' />,
    },
    {
      value: 'returned',
      label: 'Returned',
      content: <LoansTableContent status='returned' />,
    },
  ];

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <AdminBackButton />
      <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
        Loan management
      </Text>
      <Tabs items={tabs} defaultValue='all' />
    </section>
  );
}
