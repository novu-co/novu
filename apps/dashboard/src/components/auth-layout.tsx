import { ReactNode } from 'react';

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center gap-8 bg-[url('/images/auth/background.svg')]">
      <div className="flex max-w-[1100px] flex-1 flex-row">{children}</div>
    </div>
  );
};
