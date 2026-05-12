import { Progress } from '@profiq/ui/components/ui/feedback';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@profiq/ui/components/ui/overlay';
import type { HTMLAttributes } from 'react';

type StatusSpinningProps = HTMLAttributes<HTMLDivElement>;

export function StatusSpinning(props: StatusSpinningProps) {
  return (
    <div {...props}>
      <Dialog defaultOpen={true} open={true}>
        {/* Keep Radix accessible while the visual loading state stays compact. */}
        <DialogTitle className='sr-only'>Loading</DialogTitle>

        <DialogContent className='[&>button:first-of-type]:hidden justify-center'>
          <Progress value={65} className='w-64' aria-label='Loading' />
        </DialogContent>
      </Dialog>
    </div>
  );
}
