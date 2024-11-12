import { LEGACY_DASHBOARD_URL, NEW_DASHBOARD_FEEDBACK_FORM_URL } from '@/config';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { useUser } from '@clerk/clerk-react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';

export function useNewDashboardOptIn() {
  const { user } = useUser();
  const track = useTelemetry();

  const updateUserOptInStatus = (status: NewDashboardOptInStatusEnum) => {
    if (!user) return;

    user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        newDashboardOptInStatus: status,
      },
    });
  };

  const getCurrentOptInStatus = () => {
    if (!user) return null;

    return user.unsafeMetadata?.newDashboardOptInStatus || null;
  };

  const redirectToLegacyDashboard = () => {
    optOut();

    if (NEW_DASHBOARD_FEEDBACK_FORM_URL) {
      window.open(NEW_DASHBOARD_FEEDBACK_FORM_URL, '_blank');
    }

    window.location.href = LEGACY_DASHBOARD_URL || window.location.origin + '/legacy';
  };

  const optIn = () => {
    track(TelemetryEvent.NEW_DASHBOARD_OPT_IN);
    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
  };

  const optOut = () => {
    track(TelemetryEvent.NEW_DASHBOARD_OPT_OUT);
    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_OUT);
  };

  return {
    optIn,
    optOut,
    status: getCurrentOptInStatus(),
    redirectToLegacyDashboard,
  };
}
