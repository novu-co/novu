import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { InviteFormValues, inviteFormSchema, RoleType, Role } from './types';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '../../utils/constants';
import { toast } from 'sonner';
import { useOrganization } from '@clerk/clerk-react';

interface InviteMemberFormProps {
  roles: Role[];
  onSuccess?: () => void;
  onClose?: () => void;
}

export function InviteMemberForm({ roles, onSuccess, onClose }: InviteMemberFormProps) {
  const { organization, invitations } = useOrganization();
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: '',
    },
  });

  const handleInviteMember = async (data: InviteFormValues) => {
    try {
      await organization?.inviteMember({
        emailAddress: data.email,
        role: data.role,
      });
      await invitations?.revalidate?.();
      toast.success('Team member invited successfully');
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Failed to invite member');
    }
  };

  return (
    <form
      id="invite-member"
      onSubmit={form.handleSubmit(handleInviteMember)}
      className="py-4"
      {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
    >
      <div className="px-6">
        <div className="mb-4">
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
        <div className="mb-4">
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

      <div className="bg-muted/40 border-t px-6 py-4 pb-0">
        <Button type="submit" className="h-10 w-full" isLoading={form.formState.isSubmitting}>
          <span>Send Invitation</span>
        </Button>
      </div>
    </form>
  );
}
