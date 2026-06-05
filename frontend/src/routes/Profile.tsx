import UserInfo from '@/components/user-info';
import { Text } from '@profiq/ui';

export default function Profile() {
  return (
    <div data-testid='profile-page' className='max-w-xl mx-auto mt-10 px-4'>
      <Text
        as='h1'
        size='2xl'
        weight='bold'
        className='mb-6'
        dataTestId='profile-title'
      >
        Profile
      </Text>
      <UserInfo />
    </div>
  );
}
