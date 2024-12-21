import { useState, useEffect } from 'react';
import { useFetchIntegrations } from '../../hooks/use-fetch-integrations';
import { useFetchEnvironments } from '../../context/environment/hooks';
import { useAuth } from '../../context/auth/hooks';
import { ChannelTypeEnum } from '@novu/shared';
import ReactConfetti from 'react-confetti';
import { InboxConnectedGuide } from './inbox-connected-guide';
import { InboxFrameworkGuide } from './inbox-framework-guide';
import { useSearchParams } from 'react-router-dom';

export function InboxEmbed(): JSX.Element | null {
  const [showConfetti, setShowConfetti] = useState(false);
  const auth = useAuth();
  const { integrations } = useFetchIntegrations({ refetchInterval: 1000, refetchOnWindowFocus: true });
  const { environments } = useFetchEnvironments({ organizationId: auth?.currentOrganization?._id });
  const [searchParams] = useSearchParams();
  const environmentHint = searchParams.get('environmentId');

  // If hint provided, use it, otherwise use the first dev environment
  const selectedEnvironment = environments?.find((env) =>
    environmentHint ? env._id === environmentHint : !env._parentId
  );
  const subscriberId = auth?.currentUser?._id;

  const foundIntegration = integrations?.find(
    (integration) =>
      integration._environmentId === selectedEnvironment?._id && integration.channel === ChannelTypeEnum.IN_APP
  );

  const primaryColor = searchParams.get('primaryColor') || '#DD2450';
  const foregroundColor = searchParams.get('foregroundColor') || '#0E121B';

  useEffect(() => {
    if (foundIntegration?.connected) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 10000);

      return () => clearTimeout(timer);
    }
  }, [foundIntegration?.connected]);

  if (!subscriberId) return null;

  return (
    <main className="flex flex-col pl-[100px]">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={1000} />}

      {!foundIntegration?.connected && (
        <InboxFrameworkGuide
          currentEnvironment={selectedEnvironment}
          subscriberId={subscriberId}
          primaryColor={primaryColor}
          foregroundColor={foregroundColor}
        />
      )}

      {foundIntegration?.connected && (
        <InboxConnectedGuide subscriberId={subscriberId} environment={selectedEnvironment!} />
      )}
    </main>
  );
}
