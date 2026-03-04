import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Lock } from 'lucide-react';

type HoverProtectedProps = {
  inline?: boolean;
};

export function HoverProtected({ inline }: HoverProtectedProps) {
  return (
    <HoverCard openDelay={10} closeDelay={50}>
      <HoverCardTrigger>
        <Lock className={`${inline ? 'inline' : ''} size-3`} />
      </HoverCardTrigger>
      <HoverCardContent>This page is protected by auth</HoverCardContent>
    </HoverCard>
  );
}
