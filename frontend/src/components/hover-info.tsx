import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Info, type LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { Link } from 'react-router';

type TooltipReadme = {
  label: string;
  id: string;
};

// this is an alias of a generic SVG obtained from lucide-react.
// it uses ForwardRefExoticComponent to allow using ref on the icon
// that is provided by LucideProps, with the Omit removing its own ref and
// the generic ref attribute of an SVG
type LucideReactIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

type HoverInfoProps = {
  text: string;
  iconSize: number;
  inline?: boolean;
  readmeSection?: TooltipReadme;
  Icon?: LucideReactIcon;
};

export function HoverInfo({
  text,
  iconSize,
  inline,
  readmeSection,
  Icon = Info,
}: HoverInfoProps) {
  return (
    <HoverCard openDelay={10} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Icon className={`${inline ? 'inline' : ''} size-${iconSize}`} />
      </HoverCardTrigger>
      <HoverCardContent>
        {text}
        {readmeSection && (
          <>
            <div>
              For more information visit{' '}
              <Link
                to={{
                  pathname:
                    'https://gitlab.com/profiq/all/infra/profiq-reference-app',
                  hash: readmeSection.id,
                }}
                target='_blank'
              >
                README.md {readmeSection.label} section
              </Link>
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
