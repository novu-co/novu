import { LEGACY_DASHBOARD_URL } from '@/config';
import { useUser } from '@clerk/clerk-react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';

export function useNewDashboardOptIn() {
  const { user } = useUser();

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
    window.location.href = LEGACY_DASHBOARD_URL || window.location.origin + '/legacy';
  };

  const optIn = () => {
    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
  };

  const optOut = () => {
    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_OUT);
  };

  const dismiss = () => {
    updateUserOptInStatus(NewDashboardOptInStatusEnum.DISMISSED);
  };

  return {
    optIn,
    optOut,
    dismiss,
    status: getCurrentOptInStatus(),
    redirectToLegacyDashboard,
  };
}
