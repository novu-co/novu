import { ReactNode } from 'react';

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen gap-8">
      <div className="relative hidden min-w-[600px] flex-1 grow items-center bg-[url('/images/signin_bg.webp')] bg-no-repeat [background-size:70%_100%] lg:flex">
        <img src={`/images/logo-light.webp`} alt="logo" className="ml-1 mt-1 max-w-[150px] self-start" />
        <div className="translate-y-1/12 absolute right-1/2 flex translate-x-1/3 transform flex-col">
          <img src={`/images/notifications/notification_01.webp`} alt="logo" className="max-w-[400px]" />
          <img
            src={`/images/notifications/notification_02.webp`}
            alt="logo"
            className="-mt-[15px] ml-[30px] max-w-[400px]"
          />
          <img src={`/images/notifications/notification_03.webp`} alt="logo" className="-mt-[15px] max-w-[400px]" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
};
