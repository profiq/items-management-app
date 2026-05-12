import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@profiq/ui/components/ui/display';
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
  testId?: string;
};

export function HoverInfo({
  text,
  iconSize,
  inline,
  readmeSection,
  Icon = Info,
  testId = 'hover-info',
}: HoverInfoProps) {
  return (
    <HoverCard openDelay={10} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Icon
          className={`${inline ? 'inline' : ''} size-${iconSize}`}
          data-testid={`${testId}-trigger`}
        />
      </HoverCardTrigger>
      <HoverCardContent data-testid={`${testId}-content`}>
        <span data-testid={`${testId}-text`}>{text}</span>
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
                data-testid={`${testId}-link`}
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
