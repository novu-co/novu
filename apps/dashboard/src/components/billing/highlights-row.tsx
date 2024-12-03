import { Badge } from '@/components/primitives/badge';
import { ApiServiceLevelEnum } from '@novu/shared';

interface Highlight {
  text: string;
  badgeLabel?: string;
}

type PlanHighlights = {
  [key in ApiServiceLevelEnum]?: Highlight[];
};

const highlights: PlanHighlights = {
  [ApiServiceLevelEnum.FREE]: [
    { text: 'Up to 30,000 events per month' },
    { text: '3 teammates' },
    { text: '30 days Activity Feed retention' },
  ],
  [ApiServiceLevelEnum.BUSINESS]: [
    { text: 'Up to 250,000 events per month' },
    { text: '50 teammates' },
    { text: '90 days Activity Feed retention' },
  ],
  [ApiServiceLevelEnum.ENTERPRISE]: [
    { text: 'Up to 5,000,000 events per month' },
    { text: 'Unlimited teammates' },
    { text: 'SAML SSO' },
  ],
};

function PlanHighlights({ planHighlights }: { planHighlights: Highlight[] }) {
  return (
    <div className="flex-1 p-6">
      <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
        {planHighlights.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.text} {item.badgeLabel && <Badge variant="outline">{item.badgeLabel}</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HighlightsRow() {
  return (
    <div className="divide-border bg-muted/50 grid grid-cols-4 divide-x">
      <div className="p-6">
        <span className="text-muted-foreground text-sm">Highlights</span>
      </div>
      {Object.entries(highlights).map(([planName, planHighlights]) => (
        <PlanHighlights key={planName} planHighlights={planHighlights} />
      ))}
    </div>
  );
}
