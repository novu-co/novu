import { RiExternalLinkLine } from 'react-icons/ri';
import { cn } from '@/utils/ui';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  iconClassName?: string;
}

export function ExternalLink({ children, className, iconClassName, ...props }: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1 hover:underline', className)}
      {...props}
    >
      {children}
      <RiExternalLinkLine className={cn('size-4', iconClassName)} aria-hidden="true" />
    </a>
  );
}
