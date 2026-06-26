import { Link } from 'react-router';
import { Text } from '@profiq/ui';
import {
  Box,
  FolderOpen,
  MapPin,
  Tag,
  ClipboardList,
  Users,
} from 'lucide-react';

type AdminCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const cards: AdminCard[] = [
  {
    title: 'Items',
    description: 'Add, edit, archive catalog items and manage their copies.',
    href: '/admin/items',
    icon: <Box className='h-5 w-5' />,
  },
  {
    title: 'Categories',
    description: 'Manage item categories used for filtering.',
    href: '/admin/categories',
    icon: <FolderOpen className='h-5 w-5' />,
  },
  {
    title: 'Tags',
    description: 'Create and edit tags that can be assigned to items.',
    href: '/admin/tags',
    icon: <Tag className='h-5 w-5' />,
  },
  {
    title: 'Locations',
    description: 'Manage physical locations and cities for item copies.',
    href: '/admin/locations',
    icon: <MapPin className='h-5 w-5' />,
  },
  {
    title: 'Loans',
    description: 'View and manage all active and past loans.',
    href: '/admin/loans',
    icon: <ClipboardList className='h-5 w-5' />,
  },
  {
    title: 'Employees',
    description: 'Browse the employee directory.',
    href: '/employees',
    icon: <Users className='h-5 w-5' />,
  },
];

export default function Admin() {
  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 p-4'>
      <div>
        <Text as='h1' size='2xl' weight='bold' className='heading-accent'>
          Admin
        </Text>
        <Text as='p' size='sm' className='mt-1 text-muted-foreground'>
          Manage catalog content, locations, and loans.
        </Text>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {cards.map(card => (
          <Link
            key={card.href}
            to={card.href}
            className='group flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-accent'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:text-primary'>
                {card.icon}
              </div>
              <Text as='span' size='sm' weight='semibold'>
                {card.title}
              </Text>
            </div>
            <Text as='p' size='sm' className='text-muted-foreground'>
              {card.description}
            </Text>
          </Link>
        ))}
      </div>
    </section>
  );
}
