import { Avatar, AvatarFallback } from '@/components/primitives/avatar';
import { Card, CardContent, CardHeader } from '@/components/primitives/card';
import { Building2 } from 'lucide-react';
import { Separator } from '@/components/primitives/separator';

export function OrganizationNamePreview({ organizationName = 'Acme Inc.' }: { organizationName?: string }) {
  return (
    <Card className="w-fit rounded-[14px] border border-[#E1E4EA]">
      <CardHeader className="space-y-0 p-3 pb-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-[#FBFBFB]">
              <Building2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="font-label-medium text-[#1C1F2E]">{organizationName}</span>
        </div>
        <Separator className="mt-3" />
      </CardHeader>

      <CardContent className="p-[12px]">
        <div className="flex h-[38.4px] w-[275px] items-center gap-3 rounded-md bg-[color:var(--02-tokens-background-white-0)] p-2 shadow-[0px_0px_2px_0px_#E0E0E0,0px_1px_4px_-2px_rgba(24,39,75,0.02),0px_4px_4px_-2px_rgba(24,39,75,0.06)]">
          <div className="h-6 w-6 rounded bg-[#fbfbfb]" />
          <div className="h-[9.6px] w-[51.6px] rounded bg-[#f9f9f9]" />
        </div>
      </CardContent>
    </Card>
  );
}
