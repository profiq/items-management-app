import { useAuth } from '@/lib/providers/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function UserInfo() {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return <></>;
  }
  return (
    <>
      <div>Email: {user.email}</div>
      <div>UID: {user.uid}</div>
      <div>Name: {user.displayName}</div>
      <div>{user.phoneNumber ? `Phone number: ${user.phoneNumber}` : ''}</div>
      {user.photoURL && (
        <div className='flex flex-row items-center justify-center'>
          <Avatar>
            <AvatarImage src={user.photoURL}></AvatarImage>
            <AvatarFallback>User avatar</AvatarFallback>
          </Avatar>
        </div>
      )}
    </>
  );
}
export default UserInfo;
