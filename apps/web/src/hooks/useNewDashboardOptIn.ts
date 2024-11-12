import { useUser } from '@clerk/clerk-react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { NEW_DASHBOARD_URL } from '../config';

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

  const redirectToNewDashboard = () => {
    window.location.href = NEW_DASHBOARD_URL || window.location.origin;
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
    redirectToNewDashboard,
  };
}
