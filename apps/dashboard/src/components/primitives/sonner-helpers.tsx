import { ReactNode } from 'react';
import { ExternalToast, toast } from 'sonner';
import { PromoteToast, SmallToast } from './sonner';

export const smallToast = ({ children, options }: { children: ReactNode; options: ExternalToast }) => {
  return toast(<SmallToast>{children}</SmallToast>, {
    duration: 5000,
    unstyled: true,
    ...options,
  });
};

export const promoteToast = ({
  title,
  description,
  action,
  options,
}: {
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
  options?: ExternalToast;
}) => {
  return toast.custom((t) => <PromoteToast t={t} title={title} description={description} action={action} />, {
    duration: 5000,
    ...options,
  });
};
