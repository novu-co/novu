import { LEGACY_DASHBOARD_URL, NEW_DASHBOARD_FEEDBACK_FORM_URL } from '@/config';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { useUser } from '@clerk/clerk-react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';

export function useNewDashboardOptIn() {
  const { user, isLoaded } = useUser();
  const track = useTelemetry();

  const updateUserOptInStatus = async (status: NewDashboardOptInStatusEnum) => {
    if (!user) return;

    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        newDashboardOptInStatus: status,
      },
    });
  };

  const updateNewDashboardFirstVisit = (firstVisit: boolean) => {
    if (!user) return;

    user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        newDashboardFirstVisit: firstVisit,
      },
    });
  };

  const getCurrentOptInStatus = () => {
    if (!user) return null;

    return user.unsafeMetadata?.newDashboardOptInStatus || null;
  };

  const getNewDashboardFirstVisit = () => {
    if (!user) return false;

    return user.unsafeMetadata?.newDashboardFirstVisit || false;
  };

  const redirectToLegacyDashboard = () => {
    window.location.href = LEGACY_DASHBOARD_URL || window.location.origin + '/legacy/workflows';
  };

  const optOut = async () => {
    track(TelemetryEvent.NEW_DASHBOARD_OPT_OUT);
    await updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_OUT);

    if (NEW_DASHBOARD_FEEDBACK_FORM_URL) {
      window.open(NEW_DASHBOARD_FEEDBACK_FORM_URL, '_blank');
    }

    redirectToLegacyDashboard();
  };

  const optIn = async () => {
    await updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
  };

  return {
    isLoaded,
    optOut,
    optIn,
    status: getCurrentOptInStatus(),
    isFirstVisit: getNewDashboardFirstVisit(),
    updateNewDashboardFirstVisit,
    redirectToLegacyDashboard,
  };
}
