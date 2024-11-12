import { useUser } from '@clerk/clerk-react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { NEW_DASHBOARD_URL } from '../config';
import { useSegment } from '../components/providers/SegmentProvider';

export function useNewDashboardOptIn() {
  const { user } = useUser();
  const segment = useSegment();

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
    segment.track('New dashboard opt-in');
    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
  };

  const dismiss = () => {
    segment.track('New dashboard opt-in dismissed');
    updateUserOptInStatus(NewDashboardOptInStatusEnum.DISMISSED);
  };

  return {
    optIn,
    dismiss,
    status: getCurrentOptInStatus(),
    redirectToNewDashboard,
  };
}
