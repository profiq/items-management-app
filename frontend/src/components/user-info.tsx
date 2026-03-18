import { useAuth } from '@/lib/providers/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function UserInfo() {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return <></>;
  }
  return (
    <div data-testid='user-info'>
      <div data-testid='user-email'>Email: {user.email}</div>
      <div data-testid='user-uid'>UID: {user.uid}</div>
      <div data-testid='user-name'>Name: {user.displayName}</div>
      <div data-testid='user-phone'>
        {user.phoneNumber ? `Phone number: ${user.phoneNumber}` : ''}
      </div>
      {user.photoURL && (
        <div
          className='flex flex-row items-center justify-center'
          data-testid='user-avatar-container'
        >
          <Avatar>
            <AvatarImage
              src={user.photoURL}
              data-testid='user-avatar'
            ></AvatarImage>
            <AvatarFallback>User avatar</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
export default UserInfo;
