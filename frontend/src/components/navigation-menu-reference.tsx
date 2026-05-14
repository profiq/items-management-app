import { NavigationMenu } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';

export function NavigationMenuReference() {
  const { user, role } = useAuth();
  const items = [
    { id: 'main', label: 'Main page', href: '/' },
    { id: 'login', label: 'Login', href: '/login' },
    ...(user
      ? [
          { id: 'profile', label: 'Profile Page', href: '/profile' },
          { id: 'employees', label: 'List of Employees', href: '/employees' },
        ]
      : []),
    ...(role === 'admin'
      ? [{ id: 'admin', label: 'Admin', href: '/admin' }]
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
