import { Tabs } from '@profiq/ui';
import type { TabItem } from '@profiq/ui';
import { Text } from '@profiq/ui';
import CitiesTab from './CitiesTab';
import LocationsTab from './LocationsTab';

const tabs: TabItem[] = [
  {
    value: 'locations',
    label: 'Lokality',
    content: <LocationsTab />,
  },
  {
    value: 'cities',
    label: 'Města',
    content: <CitiesTab />,
  },
];

export default function AdminLocations() {
  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <Text as='h1' size='2xl' weight='bold'>
        Správa lokalit
      </Text>
      <Tabs items={tabs} defaultValue='locations' />
    </section>
  );
}
