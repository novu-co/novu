import { ReactNode } from 'react';
import { Toaster } from './primitives/sonner';

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center gap-8 bg-[url('/images/auth/background.svg')] bg-cover bg-no-repeat">
      <Toaster />

      <div className="flex max-w-[1100px] flex-1 flex-row">{children}</div>
    </div>
  );
};
