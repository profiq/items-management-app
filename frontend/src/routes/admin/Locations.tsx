import { Tabs, Text } from '@profiq/ui';
import type { TabItem } from '@profiq/ui';
import { AdminBackButton } from '@/components/AdminBackButton';
import CitiesTab from './CitiesTab';
import LocationsTab from './LocationsTab';

const tabs: TabItem[] = [
  {
    value: 'locations',
    label: 'Locations',
    content: <LocationsTab />,
  },
  {
    value: 'cities',
    label: 'Cities',
    content: <CitiesTab />,
  },
];

export default function AdminLocations() {
  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <AdminBackButton />
      <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
        Location management
      </Text>
      <Tabs items={tabs} defaultValue='locations' />
    </section>
  );
}
