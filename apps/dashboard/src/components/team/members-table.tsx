import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { Button } from '@/components/primitives/button';
import { RiDeleteBin2Line, RiUserLine, RiMoreFill, RiLockLine } from 'react-icons/ri';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/primitives/avatar';
import { Skeleton } from '@/components/primitives/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { RoleType } from './types';
import { PaginationControls } from './pagination-controls';
import { OrganizationMembershipResource } from '@clerk/types';
import { useOrganization } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';

interface MembersTableProps {
  members: OrganizationMembershipResource[];
  roles: { key: string; label: string }[];
  currentUserId: string;
  pagination: {
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
    isFetching?: boolean;
    fetchPrevious?: () => void;
    fetchNext?: () => void;
  };
  onChange?: () => void;
}

const LoadingRow = () => (
  <TableRow>
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-4 w-[140px]" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-9 w-[120px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-[200px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-[100px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8" />
    </TableCell>
  </TableRow>
);

export function MembersTable({ members, roles, currentUserId, pagination, onChange }: MembersTableProps) {
  const { organization, memberships } = useOrganization();

  const handleUpdateRole = async (userId: string, role: RoleType) => {
    if (!userId) return;

    try {
      await organization?.updateMember({
        userId,
        role,
      });
      await memberships?.revalidate?.();
      onChange?.();
      toast.success('Member role updated successfully');
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to update member role');
      console.error('Failed to update member role:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await organization?.removeMember(userId);
      await memberships?.revalidate?.();
      onChange?.();

      toast.success('Team member removed successfully');
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to remove team member');
      console.error('Failed to remove member:', err);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead className="w-[140px]">Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody
          isLoading={!members?.length && pagination.isFetching}
          loadingRows={3}
          loadingRowsContent={() => <LoadingRow />}
        >
          {members?.map((member) => (
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={member.role}
                  onValueChange={(role: RoleType) => handleUpdateRole(member.publicUserData?.userId ?? '', role)}
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
                <span className="text-muted-foreground">{member.publicUserData?.identifier}</span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">{new Date(member.createdAt).toLocaleDateString()}</span>
              </TableCell>
              <TableCell className="flex justify-center">
                {member.publicUserData?.userId === currentUserId ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-not-allowed opacity-50">
                          <RiLockLine className="text-muted-foreground size-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>You cannot delete yourself from the team</TooltipContent>
                  </Tooltip>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RiMoreFill className="text-muted-foreground size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.publicUserData?.userId ?? '')}
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
      {members?.length > 0 && (
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
