import { useOrganization } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { Button } from '@/components/primitives/button';
import { RiDeleteBin2Line, RiMailAddLine, RiUserLine } from 'react-icons/ri';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Badge } from '@/components/primitives/badge';
import { useState } from 'react';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/primitives/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/primitives/avatar';

const OrgMembersParams = {
  memberships: {
    pageSize: 5,
    keepPreviousData: true,
  },
};

const OrgInvitationsParams = {
  invitations: {
    pageSize: 5,
    keepPreviousData: true,
  },
};

const ROLE_LABELS = {
  'org:admin': 'Admin',
  'org:member': 'Member',
} as const;

type RoleType = keyof typeof ROLE_LABELS;

export function TeamManagement() {
  const { organization, memberships, invitations } = useOrganization({
    ...OrgMembersParams,
    ...OrgInvitationsParams,
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleType>('org:member');

  if (!organization) return null;

  const handleInviteMember = async () => {
    try {
      await organization.inviteMember({ emailAddress: inviteEmail, role: inviteRole });
      setInviteEmail('');
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await organization.removeMember(memberId);
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      await organization.updateMember({ userId: memberId, role });
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <RiMailAddLine className="mr-2 size-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@company.com"
                    required
                    className="h-9"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: RoleType) => setInviteRole(value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInviteMember} className="w-full">
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <div className="mb-4 flex justify-center">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invitations">
                Pending {invitations?.count ? `(${invitations.count})` : null}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="members">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships?.data?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={member.publicUserData?.imageUrl}
                            alt={`${member.publicUserData?.firstName} ${member.publicUserData?.lastName}`}
                          />
                          <AvatarFallback>
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
                        disabled={member.role === 'org:admin'}
                      >
                        <SelectTrigger className="h-8 w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'org:admin' ? 'neutral' : 'outline'} className="font-normal">
                        {ROLE_LABELS[member.role as RoleType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.role !== 'org:admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 w-8"
                        >
                          <RiDeleteBin2Line className="text-muted-foreground hover:text-destructive size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="invitations">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations?.data?.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{invitation.emailAddress}</span>
                        <span className="text-muted-foreground text-sm">Pending invitation</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">Invited</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => invitation.revoke()}>
                        <RiDeleteBin2Line className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
