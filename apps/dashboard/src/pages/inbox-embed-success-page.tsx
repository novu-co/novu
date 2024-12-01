import { AuthCard } from '../components/auth/auth-card';
import { Button } from '../components/primitives/button';
import { SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { useTelemetry } from '../hooks/use-telemetry';
import { TelemetryEvent } from '../utils/telemetry';
import { useEffect } from 'react';

export function InboxEmbedSuccessPage() {
  const navigate = useNavigate();
  const telemetry = useTelemetry();

  useEffect(() => {
    telemetry(TelemetryEvent.INBOX_EMBED_SUCCESS_PAGE_VIEWED);
  }, [telemetry]);

  function handleNavigateToDashboard() {
    navigate(ROUTES.WELCOME);
  }

  return (
    <AuthCard className="relative mt-10 block max-h-[366px] min-h-[380px] w-full max-w-[366px] border-none bg-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.15)_39.37%)]">
      <div className="flex w-full flex-col justify-center p-0">
        <div className="relative mb-[50px] flex w-full flex-row items-end justify-end p-2">
          <img src="/images/auth/success-usecase-hint.svg" alt="Onboarding succcess hint to look for inbox" />
        </div>

        <div className="flex flex-col items-center justify-center gap-[50px] p-5">
          <div className="flex flex-col items-center gap-4">
            <img src="/images/novu-logo-dark.svg" alt="Novu Logo" className="h-8" />

            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-foreground-950 text-center text-lg">See how simple that was?</h2>
              <p className="text-foreground-400 text-center text-xs">
                Robust and flexible building blocks for application notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col px-6">
          <Button
            className="mt-8 w-full rounded-xl py-3 text-white"
            variant="default"
            onClick={handleNavigateToDashboard}
          >
            Go to the Dashboard
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}

function SuccessArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="124" height="120" viewBox="0 0 124 120" fill="none" {...props}>
      <path
        d="M57.7726 41.7932C59.9124 46.9372 68.3706 63.1813 77.1347 56.9207C79.6169 55.1475 81.4268 49.3982 77.8295 47.5515C73.0325 45.0889 71.3329 52.7806 72.7927 55.8469C76.6384 63.9248 88.5427 64.7525 95.7927 61.9402C101.881 59.5785 106.414 54.2069 109.74 48.7955C111.301 46.2571 111.512 43.4148 112.876 40.8842C114.987 36.9695 114.177 43.202 114.769 45.5616C115.978 50.3831 113.773 42.6138 113.365 40.9491C112.694 38.2024 106.503 41.5659 103.969 42.4419"
        stroke="#99A0AE"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
