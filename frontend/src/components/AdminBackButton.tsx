import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function AdminBackButton() {
  return (
    <Link
      to='/admin'
      className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
    >
      <ChevronLeft className='h-4 w-4' />
      Overview
    </Link>
  );
}
