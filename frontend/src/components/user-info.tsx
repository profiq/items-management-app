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
  if (email) {
    return email[0].toUpperCase();
  }
  return '?';
}

function InfoRow({
  label,
  value,
  testId,
  mono = false,
}: {
  label: string;
  value: string | null;
  testId: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className='flex flex-col gap-1'>
      <Text
        as='span'
        size='xs'
        weight='semibold'
        className='uppercase tracking-wider text-gray-400'
      >
        {label}
      </Text>
      <Text
        as='span'
        size='sm'
        className={mono ? 'font-mono text-gray-600 break-all' : 'text-gray-800'}
        dataTestId={testId}
      >
        {value}
      </Text>
    </div>
  );
}

function UserInfo() {
  const { user, role } = useAuth();

  if (user === undefined) return null;

  const initials = getInitials(user.displayName, user.email);

  return (
    <div
      data-testid='user-info'
      className='rounded-2xl border border-gray-200 shadow-sm overflow-hidden'
    >
      <div className='bg-gradient-to-br from-indigo-50 to-blue-100 px-8 py-10 flex flex-col items-center gap-3'>
        <div className='w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-md select-none overflow-hidden'>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? user.email ?? ''}
              className='w-full h-full object-cover'
            />
          ) : (
            <Text as='span' size='xl' weight='bold' className='text-white'>
              {initials}
            </Text>
          )}
        </div>

        <div className='text-center'>
          <Text
            as='h2'
            size='xl'
            weight='semibold'
            className='text-gray-900'
            dataTestId='user-name'
          >
            {user.displayName ?? user.email}
          </Text>
          <Text
            as='p'
            size='sm'
            className='text-gray-500 mt-0.5'
            dataTestId='user-email'
          >
            {user.email}
          </Text>
        </div>

        {role && (
          <Badge
            variant={role === 'admin' ? 'outline' : 'secondary'}
            title={role === 'admin' ? 'Admin' : 'Uživatel'}
            isRounded
          />
        )}
      </div>

      <div className='px-8 py-6 flex flex-col items-center gap-5 bg-white'>
        {user.phoneNumber && (
          <InfoRow
            label='Telefon'
            value={user.phoneNumber}
            testId='user-phone'
          />
        )}
        <InfoRow label='UID' value={user.uid} testId='user-uid' mono />
      </div>
    </div>
  );
}

export default UserInfo;
