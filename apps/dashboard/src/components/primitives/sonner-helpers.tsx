import { ExternalToast, toast } from 'sonner';
import { PromoteToast, Toast, ToastProps } from './sonner';
import { ReactNode } from 'react';

export const showToast = ({
  options,
  children,
  ...toastProps
}: Omit<ToastProps, 'children'> & {
  options: ExternalToast;
  children: (args: { close: () => void }) => ReactNode;
}) => {
  return toast.custom((id) => <Toast {...toastProps}>{children({ close: () => toast.dismiss(id) })}</Toast>, {
    duration: 5000,
    unstyled: true,
    closeButton: false,
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
