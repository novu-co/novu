import { AnimatedPage } from '@/components/onboarding/animated-page';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/auth/auth-card';
import { UsecasePlaygroundHeader } from '../components/usecase-playground-header';
import { InboxEmbed } from '../components/welcome/inbox-embed';
import { useTelemetry } from '../hooks/use-telemetry';
import { ROUTES } from '../utils/routes';
import { TelemetryEvent } from '../utils/telemetry';

export function InboxEmbedPage() {
  const [searchParams] = useSearchParams();
  const telemetry = useTelemetry();

  useEffect(() => {
    telemetry(TelemetryEvent.INBOX_EMBED_PAGE_VIEWED, {
      referralSource: searchParams.get('source'),
    });
  }, [telemetry, searchParams]);

  return (
    <AnimatedPage>
      <AuthCard className="mt-10 w-full max-w-[1230px]">
        <div className="w-full">
          <div className="flex flex-1 flex-col overflow-hidden">
            <UsecasePlaygroundHeader
              title="Integrate in less than 4 minutes"
              description="You're just a couple steps away from your having a fully functional notification center in your app."
              skipPath={ROUTES.WELCOME}
              onSkip={() =>
                telemetry(TelemetryEvent.SKIP_ONBOARDING_CLICKED, {
                  skippedFrom: 'inbox-embed',
                })
              }
            />
          </div>

          <div>
            <InboxEmbed />
          </div>
        </div>
      </AuthCard>
    </AnimatedPage>
  );
}
