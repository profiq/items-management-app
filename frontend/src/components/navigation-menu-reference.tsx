import { NavigationMenu } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';

export function NavigationMenuReference() {
  const { role } = useAuth();
  const items = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'login', label: 'Login', href: '/login' },
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
