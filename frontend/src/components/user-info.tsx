import { useAuth } from '@/lib/providers/auth/useAuth';
import { Text, Badge } from '@profiq/ui';

function getInitials(displayName: string | null, email: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

function UserInfo() {
  const { user, role } = useAuth();

  if (user === undefined) return null;

  const initials = getInitials(user.displayName, user.email);

  return (
    <div
      data-testid='user-info'
      className='overflow-hidden rounded-xl border bg-card shadow-sm'
    >
      <div className='h-1.5 bg-primary' />

      <div className='flex flex-col items-center gap-4 bg-primary/5 px-8 py-10'>
        <div className='flex h-24 w-24 select-none items-center justify-center overflow-hidden rounded-full bg-primary shadow-lg ring-4 ring-background'>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? user.email ?? ''}
              className='h-full w-full object-cover'
            />
          ) : (
            <Text
              as='span'
              size='2xl'
              weight='bold'
              className='text-primary-foreground'
            >
              {initials}
            </Text>
          )}
        </div>

        <div className='text-center'>
          <Text as='h2' size='xl' weight='semibold' dataTestId='user-name'>
            {user.displayName ?? user.email}
          </Text>
          <Text
            as='p'
            size='sm'
            className='mt-0.5 text-muted-foreground'
            dataTestId='user-email'
          >
            {user.email}
          </Text>
        </div>

        {role && (
          <Badge
            variant={role === 'admin' ? 'default' : 'secondary'}
            title={role === 'admin' ? 'Admin' : 'Uživatel'}
            isRounded
            className='px-3 py-0.5'
          />
        )}
      </div>

      <div className='divide-y'>
        {user.phoneNumber && (
          <div className='flex items-center justify-between px-8 py-4'>
            <Text as='span' size='sm' className='text-muted-foreground'>
              Telefon
            </Text>
            <Text as='span' size='sm' dataTestId='user-phone'>
              {user.phoneNumber}
            </Text>
          </div>
        )}
        <div className='flex items-start justify-between gap-6 px-8 py-4'>
          <Text as='span' size='sm' className='shrink-0 text-muted-foreground'>
            UID
          </Text>
          <Text
            as='span'
            size='xs'
            className='break-all font-mono text-muted-foreground'
            dataTestId='user-uid'
          >
            {user.uid}
          </Text>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
