import { RiBookMarkedLine, RiBookmarkLine, RiExternalLinkLine } from 'react-icons/ri';
import { cn } from '@/utils/ui';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  iconClassName?: string;
  variant?: 'default' | 'documentation';
}

export function ExternalLink({ children, className, variant = 'default', iconClassName, ...props }: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-foreground-600 inline-flex items-center gap-1 hover:underline', className)}
      {...props}
    >
      {variant === 'documentation' && <RiBookMarkedLine className={cn('size-4', iconClassName)} aria-hidden="true" />}
      {variant === 'default' && <RiExternalLinkLine className={cn('size-4', iconClassName)} aria-hidden="true" />}

      {children}
    </a>
  );
}
