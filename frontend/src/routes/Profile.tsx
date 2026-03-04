import { HoverInfo } from '@/components/hover-info';
import UserInfo from '@/components/user-info';

export default function Profile() {
  return (
    <>
      <div>
        <h1>
          Profile{' '}
          <HoverInfo
            text='This is an example "protected" page and is unavailable without logging in to an account. This is ensured using the ProtectedRoute component.'
            readmeSection={{ label: 'Protected page', id: 'protected-page' }}
            iconSize={10}
            inline={true}
          />
        </h1>
        <div>Only for profiq eyes!</div>
        <div className='text-gray-250 text-sm'>
          This is client-side enforced - in terms of security, this is no
          security
        </div>
        <UserInfo></UserInfo>
      </div>
    </>
  );
}
