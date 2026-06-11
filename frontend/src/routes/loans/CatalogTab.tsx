import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Alert,
  AlertDialog,
  Badge,
  Button,
  InputField,
  Pagination,
  Select,
  Text,
} from '@profiq/ui';
import { Switch } from '@profiq/ui/components/ui/form';
import type { SelectItem } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import {
  getItems,
  type PublicCategory,
  type PublicItem,
} from '@/services/items/items';
import { borrowItem } from '@/services/loans/loans';

const PAGE_SIZE = 12;
const ALL_CATEGORIES = 'All categories';

type ItemCardProps = {
  item: PublicItem;
  onBorrow: (item: PublicItem) => void;
  isBorrowing: boolean;
};

function ItemCard({ item, onBorrow, isBorrowing }: ItemCardProps) {
  const available = item.available_copies_count ?? 0;
  const total = item.copies_count ?? 0;
  const canBorrow = available > 0;

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm'>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className='h-40 w-full object-cover'
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className='h-40 w-full bg-muted' />
      )}
      <div className='flex flex-1 flex-col gap-2 p-4'>
        <Text as='p' size='sm' weight='bold' className='line-clamp-2'>
          {item.name}
        </Text>
        {item.categories.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {item.categories.map(c => (
              <Badge
                key={c.id}
                variant='secondary'
                size='xs'
                title={c.name}
                isRounded
                className='px-2 py-0.5'
              />
            ))}
          </div>
        )}
        <Text as='p' size='xs' className='text-muted-foreground'>
          Available: {available} / {total}
        </Text>
        <div className='mt-auto pt-2'>
          <Button
            type='button'
            className='w-full'
            disabled={!canBorrow || isBorrowing}
            onClick={() => onBorrow(item)}
          >
            {canBorrow ? 'Borrow' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className='h-72 animate-pulse rounded-lg border bg-muted' />;
}

type CatalogTabProps = {
  categories: PublicCategory[];
};

export function CatalogTab({ categories }: CatalogTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryValue, setCategoryValue] = useState(ALL_CATEGORIES);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(1);
  const [itemToBorrow, setItemToBorrow] = useState<PublicItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryValue(value);
    setPage(1);
  }, []);

  const handleAvailableChange = useCallback((value: boolean) => {
    setOnlyAvailable(value);
    setPage(1);
  }, []);

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

  const selectedCategoryId = useMemo(() => {
    if (categoryValue === ALL_CATEGORIES) return undefined;
    return activeCategories.find(c => c.name === categoryValue)?.id;
  }, [categoryValue, activeCategories]);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      categoryId: selectedCategoryId,
      available: onlyAvailable || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, selectedCategoryId, onlyAvailable, page]
  );

  const itemsQuery = useQuery({
    queryKey: ['items', queryParams],
    queryFn: () => getItems(user as User, queryParams),
    enabled: !!user,
  });

  const borrowMutation = useMutation({
    mutationFn: (itemId: number) => borrowItem(user as User, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loans', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setItemToBorrow(null);
      toast.success('Item borrowed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setItemToBorrow(null);
    },
  });

  const total = itemsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex-1'>
          <InputField
            fieldLabel='Search'
            fieldPlaceholder='Name or description…'
            fieldDescription=''
            type='search'
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>
        <div className='sm:w-56'>
          <Select
            placeholder='Category'
            items={categorySelectItems}
            value={categoryValue}
            onValueChange={handleCategoryChange}
          />
        </div>
        <label className='flex items-center gap-2 text-sm font-medium cursor-pointer'>
          <Switch
            checked={onlyAvailable}
            onCheckedChange={handleAvailableChange}
          />
          Available only
        </label>
      </div>

      {itemsQuery.isError && (
        <Alert
          variant='destructive'
          title='Failed to load items'
          description={
            itemsQuery.error instanceof Error
              ? itemsQuery.error.message
              : 'Unknown error'
          }
        />
      )}

      {itemsQuery.isLoading && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {itemsQuery.data && itemsQuery.data.data.length === 0 && (
        <Text
          as='p'
          size='sm'
          className='py-12 text-center text-muted-foreground'
        >
          No items match your search.
        </Text>
      )}

      {itemsQuery.data && itemsQuery.data.data.length > 0 && (
        <>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {itemsQuery.data.data.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onBorrow={setItemToBorrow}
                isBorrowing={borrowMutation.isPending}
              />
            ))}
          </div>
          <div className='flex justify-end'>
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <AlertDialog
        open={itemToBorrow !== null}
        onOpenChange={open => {
          if (!open) setItemToBorrow(null);
        }}
        title='Borrow item'
        description={itemToBorrow ? `Borrow "${itemToBorrow.name}"?` : ''}
        actionLabel={borrowMutation.isPending ? 'Borrowing…' : 'Borrow'}
        cancelLabel='Cancel'
        onAction={() => {
          if (itemToBorrow) borrowMutation.mutate(itemToBorrow.id);
        }}
        onCancel={() => setItemToBorrow(null)}
      />
    </div>
  );
}
