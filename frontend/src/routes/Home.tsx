import { HoverProtected } from '@/components/hover-protected';
import { Card } from '@/components/ui/card';

function Home() {
  return (
    <>
      <h1 className='text-3xl font-bold underline p-2'>
        Reference website for Profiq.com
      </h1>
      <div className='text-left p-3'>
        <Card>
          <div className='p-3'>
            Welcome to the reference website of Profiq SP
          </div>
          <div className='p-3 underline'>
            As of this moment it is out of order.
          </div>
          <div className='p-3'>
            If you see an icon next to text, try to hover over it, it might
            contain more information. For example, Auth protected pages are
            accomponied by a padlock (<HoverProtected inline={true} />)
          </div>
        </Card>
      </div>
    </>
  );
}

export default Home;
