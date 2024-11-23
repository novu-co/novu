import { useEffect } from 'react';
import { setUser as sentrySetUser } from '@sentry/react';
import { useAuth } from '@/context/auth/hooks';

export function useMonitoring() {
  const { currentUser, currentOrganization } = useAuth();

  const isNovuUser = currentUser && currentUser._id && !currentUser._id.startsWith('user_');
  const isNovuOrganization =
    currentOrganization && currentOrganization._id && !currentOrganization._id.startsWith('org_');

  /*
   * if the identifier present isn't a novu identifier, we don't want to pollute our data with
   * clerk identifiers, so we will skip monitoring.
   */
  const shouldMonitor = isNovuUser && isNovuOrganization;

  useEffect(() => {
    if (currentUser && currentOrganization && shouldMonitor) {
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
  }, [currentUser, currentOrganization, shouldMonitor]);
}
