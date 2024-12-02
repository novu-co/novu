import { useOrganization, useUser } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { Button } from '@/components/primitives/button';
import { RiDeleteBin2Line, RiMailAddLine, RiUserLine, RiMailLine, RiMoreFill } from 'react-icons/ri';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Badge } from '@/components/primitives/badge';
import { Input } from '@/components/primitives/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/primitives/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/primitives/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '../../utils/ui';
import { Label } from '@/components/primitives/label';
import { useState, useEffect } from 'react';

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

interface Role {
  key: string;
  label: string;
}

type RoleType = string;

const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.string(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteMemberFormProps {
  onSubmit: (data: InviteFormValues) => Promise<void>;
}

const InviteMemberForm = ({ onSubmit }: InviteMemberFormProps) => {
  const { organization } = useOrganization();
  const [roles, setRoles] = useState<{ key: string; label: string }[]>([]);
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: '',
    },
  });

  useEffect(() => {
    async function fetchRoles() {
      if (!organization) return;

      const { data } = await organization.getRoles({
        pageSize: 20,
        initialPage: 1,
      });
      setRoles(data.map((role) => ({ key: role.key, label: role.name })));
    }

    fetchRoles();
  }, []);

  return (
    <form id="invite-member" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="px-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            {...form.register('email')}
            placeholder="member@company.com"
            className="border-input ring-offset-background text-foreground-600 placeholder:text-foreground-400 focus:ring-ring shadow-xs flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={form.watch('role')} onValueChange={(value: RoleType) => form.setValue('role', value)}>
            <SelectTrigger className="h-10 border">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.key} value={role.key} className="cursor-pointer">
                  <div className="flex w-full items-center justify-between">
                    <span>{role.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.role && (
            <p className="text-destructive text-xs">{form.formState.errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="bg-muted/40 border-t px-6 py-4">
        <Button type="submit" className="h-10 w-full" isLoading={form.formState.isSubmitting}>
          <span>Send Invitation</span>
        </Button>
      </div>
    </form>
  );
};

export function TeamManagement() {
  const { user } = useUser();
  const { organization, memberships, invitations } = useOrganization({
    ...OrgMembersParams,
    ...OrgInvitationsParams,
  });
  const [roles, setRoles] = useState<{ key: string; label: string }[]>([]);
  const currentUserId = user?.id;

  useEffect(() => {
    async function fetchRoles() {
      if (!organization) return;

      const { data } = await organization.getRoles({
        pageSize: 20,
        initialPage: 1,
      });
      setRoles(data.map((role) => ({ key: role.key, label: role.name })));
    }

    fetchRoles();
  }, []);

  if (!organization) return null;

  console.log(memberships?.data, currentUserId);
  const handleUpdateRole = async (memberId: string, role: RoleType) => {
    try {
      await organization.updateMember({
        userId: memberId,
        role,
      });
      await memberships?.revalidate?.();
    } catch (err) {
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
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  const handleRevokeInvitation = async (invitation: any) => {
    try {
      await invitation.revoke();
      await Promise.all([memberships?.revalidate?.(), invitations?.revalidate?.()]);
    } catch (err) {
      console.error('Failed to revoke invitation:', err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await organization?.removeMember(memberId);
      await memberships?.revalidate?.();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const EmptyInvitations = () => (
    <div className="border-muted-foreground/25 bg-muted/5 flex min-h-[400px] flex-col items-center justify-center space-y-5 rounded-lg border border-dashed px-4 py-12 text-center">
      <div className="from-muted/30 to-muted/10 flex size-16 items-center justify-center rounded-full bg-gradient-to-br shadow-inner">
        <RiMailLine className="text-muted-foreground size-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">No Pending Invitations</h3>
        <p className="text-muted-foreground text-sm">
          Your team's pending invitations will appear here.
          <br />
          Ready to collaborate? Invite your teammates to join.
        </p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-2">
            <RiMailAddLine className="mr-2 size-4" />
            Invite Team Members
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 sm:max-w-[400px]">
          <div className="border-b px-6 py-4">
            <DialogTitle className="text-md font-semibold tracking-tight">Invite Team Member</DialogTitle>
          </div>
          <InviteMemberForm onSubmit={handleInviteMember} />
        </DialogContent>
      </Dialog>
    </div>
  );

  const PaginationControls = () => (
    <div className="mt-4 flex justify-end gap-2">
      <Button
        variant="outline"
        disabled={!invitations?.hasPreviousPage || invitations?.isFetching}
        onClick={() => invitations?.fetchPrevious?.()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        disabled={!invitations?.hasNextPage || invitations?.isFetching}
        onClick={() => invitations?.fetchNext?.()}
      >
        Next
      </Button>
    </div>
  );

  const InvitationsTable = () => (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead className="w-[140px]">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations?.data?.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{invitation.emailAddress}</span>
                  <span className="text-muted-foreground text-sm">Pending invitation</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {invitation.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">Invited</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RiMoreFill className="text-muted-foreground size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRevokeInvitation(invitation)}
                      className="text-destructive focus:text-destructive"
                    >
                      <RiDeleteBin2Line className="mr-2 size-4" />
                      Revoke Invitation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls />
    </>
  );

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
            <Dialog>
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
                <InviteMemberForm onSubmit={handleInviteMember} />
              </DialogContent>
            </Dialog>
          </div>
          <TabsContent value="members">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead className="w-[140px]">Role</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships?.data?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border">
                          <AvatarImage
                            src={member.publicUserData?.imageUrl}
                            alt={`${member.publicUserData?.firstName} ${member.publicUserData?.lastName}`}
                          />
                          <AvatarFallback className="bg-muted">
                            <RiUserLine className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                          </span>
                          <span className="text-muted-foreground text-sm">{member.publicUserData?.identifier}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(role: RoleType) => handleUpdateRole(member.id, role)}
                        disabled={member.publicUserData?.userId === currentUserId}
                      >
                        <SelectTrigger className="h-9 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.key} value={role.key}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      {member.publicUserData?.userId !== currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <RiMoreFill className="text-muted-foreground size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <RiDeleteBin2Line className="mr-2 size-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="invitations">
            {invitations?.data?.length === 0 ? <EmptyInvitations /> : <InvitationsTable />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
