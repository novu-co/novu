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

  const optIn = () => {
    const newDashboardUrl = process.env.NEW_DASHBOARD_URL;
    if (!newDashboardUrl) return;

    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
    window.location.href = newDashboardUrl;
  };

  const optOut = () => {
    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_OUT);
  };

  const dismiss = () => {
    updateUserOptInStatus(NewDashboardOptInStatusEnum.DISMISSED);
  };

  return { optIn, optOut, dismiss, status: getCurrentOptInStatus() };
}
