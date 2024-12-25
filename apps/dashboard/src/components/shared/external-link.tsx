import { RiBookMarkedLine, RiArrowRightUpLine, RiQuestionLine } from 'react-icons/ri';
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

  const finalIconClassName = cn('inline size-3 mb-1', iconClassName);

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-foreground-400 inline-flex items-center text-xs underline', className)}
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
      {variant === 'documentation' && <RiBookMarkedLine className={finalIconClassName} aria-hidden="true" />}
      {variant === 'default' && <RiArrowRightUpLine className={finalIconClassName} aria-hidden="true" />}
      {variant === 'tip' && <RiQuestionLine className={finalIconClassName} aria-hidden="true" />}
    </a>
  );
}
