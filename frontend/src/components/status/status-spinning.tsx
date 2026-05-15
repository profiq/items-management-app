import { Dialog } from '@profiq/ui';
import type { HTMLAttributes } from 'react';

type StatusSpinningProps = HTMLAttributes<HTMLDivElement>;

export function StatusSpinning(props: StatusSpinningProps) {
  return (
    <div {...props}>
      <Dialog
        open={true}
        title={<span className='sr-only'>Loading</span>}
        className='[&>button:first-of-type]:hidden justify-center'
      >
        <div
          className='h-2 w-64 overflow-hidden rounded-full bg-muted'
          role='progressbar'
          aria-label='Loading'
          aria-busy='true'
        >
          <div className='h-full w-[65%] animate-pulse rounded-full bg-primary' />
        </div>
      </Dialog>
    </div>
  );
}
