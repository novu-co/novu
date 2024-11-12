import { UserButton } from '@clerk/clerk-react';
import { ROUTES } from '@/utils/routes';
import { useNewDashboardOptIn } from '@/hooks/use-new-dashboard-opt-in';
import { RiSignpostFill } from 'react-icons/ri';

export function UserProfile() {
  const { redirectToLegacyDashboard } = useNewDashboardOptIn();

  return (
    <UserButton afterSignOutUrl={ROUTES.SIGN_IN}>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Go back to the legacy dashboard"
          labelIcon={<RiSignpostFill size="16" color="var(--nv-colors-typography-text-main)" />}
          onClick={redirectToLegacyDashboard}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
