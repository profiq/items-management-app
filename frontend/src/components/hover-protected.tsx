import { Lock } from 'lucide-react';
import { HoverInfo } from './hover-info';

type HoverProtectedProps = {
  inline?: boolean;
};

export function HoverProtected({ inline }: HoverProtectedProps) {
  return (
    <HoverInfo
      iconSize={3}
      inline={inline}
      Icon={Lock}
      text={'This page is protected by auth'}
    />
  );
}
