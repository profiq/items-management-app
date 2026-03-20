export default function VersionInfo() {
  return (
    <>
      <div
        data-testid='version-info-row'
        className='mt-4 flex border bg-gray-50 w-full p-3 rounded justify-center'
      >
        <div className='text-gray-700 text-sm'>
          Version: {import.meta.env.VITE_VERSION}
        </div>
      </div>
    </>
  );
}
