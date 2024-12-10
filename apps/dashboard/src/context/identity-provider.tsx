import { useEffect, useRef } from 'react';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useAuth } from './auth/hooks';
import { useSegment } from './segment/hooks';
import { setUser as sentrySetUser } from '@sentry/react';

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const ldClient = useLDClient();
  const segment = useSegment();
  const { currentUser, currentOrganization } = useAuth();
  const hasIdentified = useRef(false);

  const isNovuUser = currentUser && currentUser._id && !currentUser._id.startsWith('user_');
  const isNovuOrganization =
    currentOrganization && currentOrganization._id && !currentOrganization._id.startsWith('org_');
  const shouldMonitor = isNovuUser && isNovuOrganization;

  useEffect(() => {
    if (!currentOrganization || !currentUser || hasIdentified.current) return;

    if (ldClient) {
      ldClient.identify({
        kind: 'multi',
        organization: {
          key: currentOrganization._id,
          name: currentOrganization.name,
          createdAt: currentOrganization.createdAt,
        },
        user: {
          key: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
        },
      });
    }

    if (shouldMonitor) {
      segment.identify(currentUser);

      sentrySetUser({
        email: currentUser.email ?? '',
        username: `${currentUser.firstName} ${currentUser.lastName}`,
        id: currentUser._id,
        organizationId: currentOrganization._id,
        organizationName: currentOrganization.name,
      });
    } else {
      sentrySetUser(null);
    }

    hasIdentified.current = true;
  }, [ldClient, currentOrganization, currentUser, segment, shouldMonitor]);

  return <>{children}</>;
}
