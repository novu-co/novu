import { useOrganization, useUser } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/primitives/card';
import { Button } from '@/components/primitives/button';
import { RiMailAddLine } from 'react-icons/ri';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/primitives/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { useState, useEffect } from 'react';
import { Role } from './types';
import { MembersTable } from './members-table';
import { InvitationsTable } from './invitations-table';
import { InviteMemberForm } from './invite-member-form';
import { EmptyInvitations } from './empty-invitations';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/primitives/skeleton';

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

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  if (!organization) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="border-none p-0 shadow-none">
        <CardContent className="px-2.5 py-1.5">
          <Tabs defaultValue="members" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <TabsList className="bg-muted relative inline-flex h-10 space-x-1 rounded-lg p-1">
                <TabsTrigger
                  value="members"
                  className="hover:bg-background/10 group relative rounded-md px-6 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">Members</span>
                </TabsTrigger>
                <TabsTrigger
                  value="invitations"
                  className="hover:bg-background/10 group relative rounded-md px-6 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    Pending
                    {invitations?.count ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs"
                      >
                        {invitations.count}
                      </motion.span>
                    ) : null}
                  </span>
                </TabsTrigger>
              </TabsList>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="group relative overflow-hidden transition-all hover:shadow-lg" variant="default">
                    <motion.span
                      className="from-primary/10 absolute inset-0 bg-gradient-to-r to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <RiMailAddLine className="mr-2.5 size-4 transition-transform" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 sm:max-w-[400px]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="border-b px-6 py-4">
                      <DialogTitle className="text-xl font-semibold tracking-tight">Invite Team Member</DialogTitle>
                    </div>
                    <InviteMemberForm
                      roles={roles}
                      onClose={async () => {
                        setIsDialogOpen(false);
                        await memberships?.revalidate?.();
                        await invitations?.revalidate?.();
                      }}
                    />
                  </motion.div>
                </DialogContent>
              </Dialog>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="members" asChild>
                <motion.div {...fadeInUp}>
                  <MembersTable
                    onChange={() => {
                      memberships?.revalidate?.();
                    }}
                    members={memberships?.data ?? []}
                    roles={roles}
                    currentUserId={currentUserId ?? ''}
                    pagination={{
                      hasPreviousPage: memberships?.hasPreviousPage,
                      hasNextPage: memberships?.hasNextPage,
                      isFetching: memberships?.isFetching,
                      fetchPrevious: memberships?.fetchPrevious,
                      fetchNext: memberships?.fetchNext,
                    }}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="invitations" asChild>
                <motion.div {...fadeInUp}>
                  {!invitations?.data?.length && !invitations?.isFetching ? (
                    <EmptyInvitations />
                  ) : (
                    <InvitationsTable
                      invitations={invitations.data}
                      onRevokeInvitation={async () => {
                        await Promise.all([memberships?.revalidate?.(), invitations?.revalidate?.()]);
                      }}
                      pagination={{
                        hasPreviousPage: invitations.hasPreviousPage,
                        hasNextPage: invitations.hasNextPage,
                        isFetching: invitations.isFetching,
                        fetchPrevious: invitations.fetchPrevious,
                        fetchNext: invitations.fetchNext,
                      }}
                    />
                  )}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
