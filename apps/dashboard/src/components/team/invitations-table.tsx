import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { Button } from '@/components/primitives/button';
import { RiDeleteBin2Line } from 'react-icons/ri';
import { PaginationControls } from './pagination-controls';
import { InvitationStatusBadge } from './invitation-status-badge';
import { OrganizationInvitationResource } from '@clerk/types';

interface InvitationsTableProps {
  invitations: OrganizationInvitationResource[];
  onRevokeInvitation: (invitation: OrganizationInvitationResource) => Promise<void>;
  pagination: {
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
    isFetching?: boolean;
    fetchPrevious?: () => void;
    fetchNext?: () => void;
  };
}

export function InvitationsTable({ invitations, onRevokeInvitation, pagination }: InvitationsTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody isLoading={!invitations && pagination.isFetching} loadingRows={3}>
          {invitations?.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <span className="text-muted-foreground">{invitation.emailAddress}</span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">{invitation.role}</span>
              </TableCell>
              <TableCell>
                <InvitationStatusBadge status={invitation.status} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRevokeInvitation(invitation)}>
                  <RiDeleteBin2Line className="text-destructive size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {invitations?.length > 0 && (
        <PaginationControls
          hasPreviousPage={pagination.hasPreviousPage}
          hasNextPage={pagination.hasNextPage}
          isFetching={pagination.isFetching}
          onPrevious={pagination.fetchPrevious}
          onNext={pagination.fetchNext}
        />
      )}
    </>
  );
}
