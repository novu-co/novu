import { Badge } from '@/components/primitives/badge';
import { OrganizationInvitationStatus } from '@clerk/types';

interface InvitationStatusBadgeProps {
  status: OrganizationInvitationStatus;
}

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    accepted: { variant: 'success', label: 'Accepted' },
    expired: { variant: 'destructive', label: 'Expired' },
    revoked: { variant: 'destructive', label: 'Revoked' },
  } as const;

  const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] ?? {
    variant: 'secondary',
    label: status,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
