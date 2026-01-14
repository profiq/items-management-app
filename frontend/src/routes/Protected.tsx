import UserInfo from '@/components/user-info';

function Protected() {
  return (
    <>
      <div>
        <h1>Protected page</h1>
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
export default Protected;
