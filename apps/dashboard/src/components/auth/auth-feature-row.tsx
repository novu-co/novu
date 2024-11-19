import { ReactNode } from 'react';

interface AuthFeatureRowProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function AuthFeatureRow({ icon, title, description }: AuthFeatureRowProps) {
  return (
    <div className="inline-flex items-start justify-start gap-3.5 self-stretch">
      <div className="flex items-center justify-center p-1">{icon}</div>
      <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
        <div className="self-stretch text-sm font-medium leading-tight text-[#0d111b]">{title}</div>
        <div className="self-stretch text-xs font-medium text-[#99a0ad]">{description}</div>
      </div>
    </div>
  );
}
