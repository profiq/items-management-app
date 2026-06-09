import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Alert, Badge, Button, Text } from '@profiq/ui';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import { getLoanStatus, getMyLoans, type MyLoan } from '@/services/loans/loans';

const DUE_SOON_DAYS = 7;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: 'default' | 'warning' | 'danger' | 'success';
};

function StatCard({ label, value, icon, accent = 'default' }: StatCardProps) {
  const accentClass = {
    default: 'text-foreground',
    warning: 'text-amber-600',
    danger: 'text-destructive',
    success: 'text-emerald-600',
  }[accent];

  return (
    <div className='flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm'>
      <div className={`shrink-0 ${accentClass}`}>{icon}</div>
      <div className='flex flex-col'>
        <Text as='span' size='2xl' weight='bold' className={accentClass}>
          {value}
        </Text>
        <Text as='span' size='sm' className='text-muted-foreground'>
          {label}
        </Text>
      </div>
    </div>
  );
}

function BorrowedRow({ loan }: { loan: MyLoan }) {
  const status = getLoanStatus(loan);
  const days = daysUntil(loan.due_date);
  const dueLabel =
    status === 'overdue'
      ? `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
      : days === 0
        ? 'Due today'
        : `Due in ${days} day${days === 1 ? '' : 's'}`;

  return (
    <div className='flex items-center gap-4 border-b p-4 last:border-b-0'>
      {loan.copy.item.image_url ? (
        <img
          src={loan.copy.item.image_url}
          alt={loan.copy.item.name}
          className='h-12 w-12 flex-shrink-0 rounded-md border object-cover'
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className='h-12 w-12 flex-shrink-0 rounded-md border bg-muted' />
      )}
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <Text as='p' size='sm' weight='medium' className='truncate'>
          {loan.copy.item.name}
        </Text>
        <Text as='p' size='xs' className='text-muted-foreground'>
          Due {formatDate(loan.due_date)}
        </Text>
      </div>
      <Badge
        variant={status === 'overdue' ? 'destructive' : 'secondary'}
        title={dueLabel}
        isRounded
        className='shrink-0 px-2 py-0.5'
      />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const loansQuery = useQuery({
    queryKey: ['my-loans', user?.uid],
    queryFn: () => getMyLoans(user as User),
    enabled: !!user,
  });

  const loans = useMemo(() => loansQuery.data ?? [], [loansQuery.data]);

  const stats = useMemo(() => {
    let active = 0;
    let overdue = 0;
    let dueSoon = 0;
    let returned = 0;
    for (const loan of loans) {
      const status = getLoanStatus(loan);
      if (status === 'returned') {
        returned += 1;
      } else if (status === 'overdue') {
        overdue += 1;
      } else {
        active += 1;
        const days = daysUntil(loan.due_date);
        if (days <= DUE_SOON_DAYS) dueSoon += 1;
      }
    }
    return { active, overdue, dueSoon, returned };
  }, [loans]);

  const currentlyBorrowed = useMemo(
    () =>
      loans
        .filter(l => getLoanStatus(l) !== 'returned')
        .sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [loans]
  );

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <div className='flex flex-col gap-1'>
        <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
          Overview
        </Text>
        <Text as='p' size='sm' className='text-muted-foreground'>
          {user?.displayName
            ? `Welcome back, ${user.displayName}.`
            : 'Welcome back.'}
        </Text>
      </div>

      {loansQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load your loans'
          description={
            loansQuery.error instanceof Error
              ? loansQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {loansQuery.isLoading ? (
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-24 animate-pulse rounded-xl border bg-muted'
            />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <StatCard
            label='Active loans'
            value={stats.active}
            icon={<Package className='h-7 w-7' aria-hidden='true' />}
          />
          <StatCard
            label='Overdue'
            value={stats.overdue}
            icon={<AlertTriangle className='h-7 w-7' aria-hidden='true' />}
            accent='danger'
          />
          <StatCard
            label='Due soon'
            value={stats.dueSoon}
            icon={<CalendarClock className='h-7 w-7' aria-hidden='true' />}
            accent='warning'
          />
          <StatCard
            label='Returned'
            value={stats.returned}
            icon={<CheckCircle2 className='h-7 w-7' aria-hidden='true' />}
            accent='success'
          />
        </div>
      )}

      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <Text as='h2' size='lg' weight='semibold' className='heading-accent'>
            Currently borrowed
          </Text>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/loans')}
          >
            Browse catalog
          </Button>
        </div>

        {!loansQuery.isLoading && currentlyBorrowed.length === 0 ? (
          <div className='rounded-lg border bg-card p-8 text-center'>
            <Text as='p' size='sm' className='text-muted-foreground'>
              You have no borrowed items. Visit the catalog to borrow something.
            </Text>
          </div>
        ) : (
          <div className='rounded-lg border bg-card'>
            {currentlyBorrowed.map(loan => (
              <BorrowedRow key={loan.id} loan={loan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
