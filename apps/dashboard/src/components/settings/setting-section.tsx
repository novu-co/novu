import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/primitives/card';

interface SettingSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <Card className="w-full overflow-hidden shadow-none">
      <CardHeader>
        {title}
        {description && <p className="text-foreground-600 mt-1 text-xs">{description}</p>}
      </CardHeader>

      <CardContent className="rounded-b-xl border-t bg-neutral-50 bg-white p-3">
        <div className="space-y-4 p-3">{children}</div>
      </CardContent>
    </Card>
  );
}
