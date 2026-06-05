import { useQuery } from '@tanstack/react-query';
import { Alert, Tabs, Text } from '@profiq/ui';
import type { TabItem } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';
import type { User } from '@/lib/contexts';
import { getCategories } from '@/services/items/items';
import { CatalogTab } from './CatalogTab';
import { MyLoansTab } from './MyLoansTab';

export default function Dashboard() {
  const { user } = useAuth();

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(user as User),
    enabled: !!user,
  });

  const categories = categoriesQuery.data ?? [];

  const mainTabItems: TabItem[] = [
    {
      value: 'catalog',
      label: 'Katalog',
      content: <CatalogTab categories={categories} />,
    },
    {
      value: 'loans',
      label: 'Moje výpůjčky',
      content: <MyLoansTab categories={categories} />,
    },
  ];

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <Text as='h1' size='2xl' weight='bold'>
        Dashboard
      </Text>

      {categoriesQuery.isError && (
        <Alert
          variant='destructive'
          title='Nepodařilo se načíst kategorie'
          description={
            categoriesQuery.error instanceof Error
              ? categoriesQuery.error.message
              : 'Neznámá chyba'
          }
        />
      )}

      <Tabs items={mainTabItems} defaultValue='catalog' />
    </section>
  );
}
