import { NavigationMenu } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';

export function NavigationMenuReference() {
  const { user, role } = useAuth();
  const items = [
    { id: 'login', label: 'Login', href: '/login' },
    ...(user
      ? [
          { id: 'profile', label: 'Profile Page', href: '/profile' },
          { id: 'employees', label: 'List of Employees', href: '/employees' },
        ]
      : []),
    ...(user && role === 'admin'
      ? [
          { id: 'admin', label: 'Admin', href: '/admin' },
          { id: 'admin-items', label: 'Admin Items', href: '/admin/items' },
          {
            id: 'admin-categories',
            label: 'Admin Categories',
            href: '/admin/categories',
          },
        ]
      : []),
  ];

  return (
    <NavigationMenu
      items={items}
      viewport={false}
      ariaLabel='Main navigation'
    />
  );
}
