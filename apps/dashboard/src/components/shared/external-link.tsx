import { RiBookMarkedLine, RiExternalLinkLine, RiQuestionLine } from 'react-icons/ri';
import { cn } from '@/utils/ui';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  iconClassName?: string;
  variant?: 'default' | 'documentation' | 'tip';
}

export function ExternalLink({
  children,
  className,
  variant = 'default',
  iconClassName,
  href,
  ...props
}: ExternalLinkProps) {
  const telemetry = useTelemetry();

  const handleClick = () => {
    telemetry(TelemetryEvent.EXTERNAL_LINK_CLICKED, {
      href,
      variant,
    });
  };

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-foreground-600 inline-flex items-center gap-1 hover:underline', className)}
      href={href}
      onClick={handleClick}
      {...props}
    >
      {variant === 'documentation' && <RiBookMarkedLine className={cn('size-4', iconClassName)} aria-hidden="true" />}
      {variant === 'default' && <RiExternalLinkLine className={cn('size-4', iconClassName)} aria-hidden="true" />}
      {variant === 'tip' && <RiQuestionLine className={cn('size-4', iconClassName)} aria-hidden="true" />}
      {children}
    </a>
  );
}
