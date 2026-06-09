import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Alert,
  AlertDialog,
  Badge,
  Button,
  InputField,
  Select,
  Tabs,
  Text,
} from '@profiq/ui';
import type { TabItem } from '@profiq/ui';
import type { SelectItem } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import type { PublicCategory } from '@/services/items/items';
import {
  getLoanStatus,
  getMyLoans,
  returnLoan,
  type LoanStatus,
  type MyLoan,
} from '@/services/loans/loans';

const ALL_CATEGORIES = 'All categories';

const STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Active',
  overdue: 'Overdue',
  returned: 'Returned',
};

const STATUS_VARIANTS: Record<
  LoanStatus,
  'default' | 'destructive' | 'secondary'
> = {
  active: 'default',
  overdue: 'destructive',
  returned: 'secondary',
};

function formatDate(dateStr: string): string {
  // Date-only strings (YYYY-MM-DD) parse as UTC midnight, which shifts the
  // displayed day in negative-offset timezones. Build a local date instead.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type LoanRowProps = {
  loan: MyLoan;
  onReturn: (loan: MyLoan) => void;
  isReturning: boolean;
};

function LoanRow({ loan, onReturn, isReturning }: LoanRowProps) {
  const status = getLoanStatus(loan);
  const canReturn = status !== 'returned';

  return (
    <div className='flex items-center gap-4 border-b p-4 last:border-b-0'>
      {loan.copy.item.image_url ? (
        <img
          src={loan.copy.item.image_url}
          alt={loan.copy.item.name}
          className='h-14 w-14 flex-shrink-0 rounded-md border object-cover'
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className='h-14 w-14 flex-shrink-0 rounded-md border bg-muted' />
      )}
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <Text as='p' size='sm' weight='medium' className='truncate'>
          {loan.copy.item.name}
        </Text>
        {loan.copy.location && (
          <Text as='p' size='xs' className='text-muted-foreground'>
            {loan.copy.location.name}
          </Text>
        )}
        <Text as='p' size='xs' className='text-muted-foreground'>
          Borrowed: {formatDate(loan.borrowed_at)} · Due:{' '}
          {formatDate(loan.due_date)}
        </Text>
      </div>
      <div className='flex flex-shrink-0 items-center gap-3'>
        <Badge
          variant={STATUS_VARIANTS[status]}
          title={STATUS_LABELS[status]}
          isRounded
          className='px-2 py-0.5'
        />
        {canReturn && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isReturning}
            onClick={() => onReturn(loan)}
          >
            Return
          </Button>
        )}
      </div>
    </div>
  );
}

type LoanListProps = {
  loans: MyLoan[];
  onReturn: (loan: MyLoan) => void;
  isReturning: boolean;
};

function LoanList({ loans, onReturn, isReturning }: LoanListProps) {
  if (loans.length === 0) {
    return (
      <Text as='p' size='sm' className='py-8 text-center text-muted-foreground'>
        No loans.
      </Text>
    );
  }

  return (
    <div className='rounded-lg border'>
      {loans.map(loan => (
        <LoanRow
          key={loan.id}
          loan={loan}
          onReturn={onReturn}
          isReturning={isReturning}
        />
      ))}
    </div>
  );
}

type MyLoansTabProps = {
  categories: PublicCategory[];
};

export function MyLoansTab({ categories }: MyLoansTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryValue, setCategoryValue] = useState(ALL_CATEGORIES);
  const [loanToReturn, setLoanToReturn] = useState<MyLoan | null>(null);

  const loansQuery = useQuery({
    queryKey: ['my-loans', user?.uid],
    queryFn: () => getMyLoans(user as User),
    enabled: !!user,
  });

  const returnMutation = useMutation({
    mutationFn: (loanId: number) => returnLoan(user as User, loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loans', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setLoanToReturn(null);
      toast.success('Item returned');
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setLoanToReturn(null);
    },
  });

  const activeCategories = useMemo(
    () => categories.filter(c => c.archived_at === null),
    [categories]
  );

  const categorySelectItems: SelectItem[] = useMemo(
    () => [
      { id: 'all', value: ALL_CATEGORIES },
      ...activeCategories.map(c => ({ id: String(c.id), value: c.name })),
    ],
    [activeCategories]
  );

  const filteredLoans = useMemo(() => {
    const loans = loansQuery.data ?? [];
    const selectedCategory =
      categoryValue === ALL_CATEGORIES
        ? undefined
        : activeCategories.find(c => c.name === categoryValue);
    return loans.filter(loan => {
      if (
        search &&
        !loan.copy.item.name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (selectedCategory) {
        if (
          !loan.copy.item.categories.some(c => c.id === selectedCategory.id)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [loansQuery.data, search, categoryValue, activeCategories]);

  const activeLoans = filteredLoans.filter(l => getLoanStatus(l) === 'active');
  const overdueLoans = filteredLoans.filter(
    l => getLoanStatus(l) === 'overdue'
  );
  const returnedLoans = filteredLoans.filter(
    l => getLoanStatus(l) === 'returned'
  );

  const handleReturn = (loan: MyLoan) => setLoanToReturn(loan);

  const statusTabItems: TabItem[] = [
    {
      value: 'all',
      label: `All (${filteredLoans.length})`,
      content: (
        <LoanList
          loans={filteredLoans}
          onReturn={handleReturn}
          isReturning={returnMutation.isPending}
        />
      ),
    },
    {
      value: 'active',
      label: `Active (${activeLoans.length})`,
      content: (
        <LoanList
          loans={activeLoans}
          onReturn={handleReturn}
          isReturning={returnMutation.isPending}
        />
      ),
    },
    {
      value: 'overdue',
      label: `Overdue (${overdueLoans.length})`,
      content: (
        <LoanList
          loans={overdueLoans}
          onReturn={handleReturn}
          isReturning={returnMutation.isPending}
        />
      ),
    },
    {
      value: 'returned',
      label: `Returned (${returnedLoans.length})`,
      content: (
        <LoanList
          loans={returnedLoans}
          onReturn={handleReturn}
          isReturning={returnMutation.isPending}
        />
      ),
    },
  ];

  if (loansQuery.isLoading) {
    return (
      <div className='flex flex-col gap-3'>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className='h-20 animate-pulse rounded-lg border bg-muted'
          />
        ))}
      </div>
    );
  }

  if (loansQuery.isError) {
    return (
      <Alert
        variant='destructive'
        title='Failed to load loans'
        description={
          loansQuery.error instanceof Error
            ? loansQuery.error.message
            : 'Unknown error'
        }
      />
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex-1'>
          <InputField
            fieldLabel='Search'
            fieldPlaceholder='Item name…'
            fieldDescription=''
            type='search'
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className='sm:w-56'>
          <Select
            placeholder='Category'
            items={categorySelectItems}
            value={categoryValue}
            onValueChange={setCategoryValue}
          />
        </div>
      </div>

      <Tabs items={statusTabItems} defaultValue='all' />

      <AlertDialog
        open={loanToReturn !== null}
        onOpenChange={open => {
          if (!open) setLoanToReturn(null);
        }}
        title='Return item'
        description={
          loanToReturn ? `Return "${loanToReturn.copy.item.name}"?` : ''
        }
        actionLabel={returnMutation.isPending ? 'Returning…' : 'Return'}
        cancelLabel='Cancel'
        onAction={() => {
          if (loanToReturn) returnMutation.mutate(loanToReturn.id);
        }}
        onCancel={() => setLoanToReturn(null)}
      />
    </div>
  );
}
