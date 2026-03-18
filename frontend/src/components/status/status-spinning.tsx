import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { HTMLAttributes } from 'react';

type StatusSpinningProps = HTMLAttributes<HTMLDivElement>;

export function StatusSpinning(props: StatusSpinningProps) {
  return (
    <div {...props}>
      <Dialog defaultOpen={true} open={true}>
        {/* This is so that javascript does not error in console due to screen reader compatibility*/}
        <DialogTitle className='sr-only'>Loading</DialogTitle>

        <DialogContent className='[&>button:first-of-type]:hidden justify-center'>
          <Spinner className='size-32' />
        </DialogContent>
      </Dialog>
    </div>
  );
}
