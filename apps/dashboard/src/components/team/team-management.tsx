import { useOrganization, useUser } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/primitives/card';
import { Button } from '@/components/primitives/button';
import { RiMailAddLine } from 'react-icons/ri';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/primitives/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { useState, useEffect } from 'react';
import { InviteFormValues, Role } from './types';
import { MembersTable } from './members-table';
import { InvitationsTable } from './invitations-table';
import { InviteMemberForm } from './invite-member-form';
import { EmptyInvitations } from './empty-invitations';
import { toast } from 'sonner';

const OrgMembersParams = {
  memberships: {
    pageSize: 10,
    keepPreviousData: true,
  },
};

const OrgInvitationsParams = {
  invitations: {
    pageSize: 10,
    keepPreviousData: true,
  },
};

export function TeamManagement() {
  const { user } = useUser();
  const { organization, memberships, invitations } = useOrganization({
    ...OrgMembersParams,
    ...OrgInvitationsParams,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const currentUserId = user?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchRoles() {
      if (!organization) return;

      try {
        const { data } = await organization.getRoles({
          pageSize: 20,
          initialPage: 1,
        });
        setRoles(data.map((role) => ({ key: role.key, label: role.name })));
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    }

    fetchRoles();
  }, [organization?.id]);

  if (!organization) return null;

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      await organization.updateMember({
        userId: memberId,
        role,
      });
      await memberships?.revalidate?.();
      toast.success('Member role updated successfully');
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to update member role');
      console.error('Failed to update member role:', err);
    }
  };

  const handleInviteMember = async (data: InviteFormValues) => {
    try {
      await organization?.inviteMember({
        emailAddress: data.email,
        role: data.role,
      });
      await invitations?.revalidate?.();
      toast.success('Team member invited successfully');
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to invite member');
    }
  };

  const handleRevokeInvitation = async (invitation: any) => {
    try {
      await invitation.revoke();
      await Promise.all([memberships?.revalidate?.(), invitations?.revalidate?.()]);
      toast.success('Invitation revoked successfully');
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to revoke invitation');
      console.error('Failed to revoke invitation:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await organization?.removeMember(userId);
      await memberships?.revalidate?.();
      toast.success('Team member removed successfully');
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to remove team member');
      console.error('Failed to remove member:', err);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <TabsList className="bg-muted inline-flex h-10 space-x-1 rounded-lg p-1">
              <TabsTrigger value="members" className="rounded-md px-6">
                Members
              </TabsTrigger>
              <TabsTrigger value="invitations" className="rounded-md px-6">
                Pending {invitations?.count ? `(${invitations.count})` : null}
              </TabsTrigger>
            </TabsList>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <RiMailAddLine className="mr-2.5 size-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 sm:max-w-[400px]">
                <div className="border-b px-6 py-4">
                  <DialogTitle className="text-xl font-semibold tracking-tight">Invite Team Member</DialogTitle>
                </div>
                <InviteMemberForm onSubmit={handleInviteMember} roles={roles} />
              </DialogContent>
            </Dialog>
          </div>
          <TabsContent value="members">
            <MembersTable
              members={memberships?.data ?? []}
              roles={roles}
              currentUserId={currentUserId ?? ''}
              onUpdateRole={handleUpdateRole}
              onRemoveMember={handleRemoveMember}
              pagination={{
                hasPreviousPage: memberships?.hasPreviousPage,
                hasNextPage: memberships?.hasNextPage,
                isFetching: memberships?.isFetching,
                fetchPrevious: memberships?.fetchPrevious,
                fetchNext: memberships?.fetchNext,
              }}
            />
          </TabsContent>
          <TabsContent value="invitations">
            {!invitations?.data?.length && !invitations?.isFetching ? (
              <EmptyInvitations />
            ) : (
              <InvitationsTable
                invitations={invitations.data}
                onRevokeInvitation={handleRevokeInvitation}
                pagination={{
                  hasPreviousPage: invitations.hasPreviousPage,
                  hasNextPage: invitations.hasNextPage,
                  isFetching: invitations.isFetching,
                  fetchPrevious: invitations.fetchPrevious,
                  fetchNext: invitations.fetchNext,
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
