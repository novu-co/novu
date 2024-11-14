import { useUser } from '@clerk/clerk-react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { NEW_DASHBOARD_URL } from '../config';
import { useSegment } from '../components/providers/SegmentProvider';

export function useNewDashboardOptIn() {
  const { user, isLoaded } = useUser();
  const segment = useSegment();

  const updateUserOptInStatus = async (status: NewDashboardOptInStatusEnum) => {
    if (!user) return;

    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        newDashboardOptInStatus: status,
        newDashboardFirstVisit: true,
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

  const optIn = async () => {
    segment.track('New dashboard opt-in');
    await updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
    localStorage.setItem('mantine-theme', 'light');
    redirectToNewDashboard();
  };

  const dismiss = () => {
    segment.track('New dashboard opt-in dismissed');
    updateUserOptInStatus(NewDashboardOptInStatusEnum.DISMISSED);
  };

  return {
    isLoaded,
    optIn,
    dismiss,
    status: getCurrentOptInStatus(),
  };
}
