import { z } from 'zod';

export interface Role {
  key: string;
  label: string;
}

export type RoleType = string;

export const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.string(),
});

export type InviteFormValues = z.infer<typeof inviteFormSchema>;

export interface PaginationControlsProps {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  isFetching?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}
