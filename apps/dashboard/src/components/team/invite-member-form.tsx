import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { InviteFormValues, inviteFormSchema, RoleType, Role } from './types';

interface InviteMemberFormProps {
  onSubmit: (data: InviteFormValues) => Promise<void>;
  roles: Role[];
}

export function InviteMemberForm({ onSubmit, roles }: InviteMemberFormProps) {
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: '',
    },
  });

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
}
