import { UserButton } from '@clerk/clerk-react';
import { useNewDashboardOptIn } from '@/hooks/use-new-dashboard-opt-in';
import { RiSignpostFill } from 'react-icons/ri';
import { ROUTES } from '../utils/routes';

export function UserProfile() {
  const { optOut } = useNewDashboardOptIn();

  return (
    <UserButton
      userProfileUrl={ROUTES.SETTINGS_ACCOUNT}
      appearance={{
        elements: {
          avatarBox: 'h-6 w-6',
          userButtonTrigger: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Action
          label="Go back to the legacy Dashboard"
          labelIcon={<RiSignpostFill size="16" color="var(--nv-colors-typography-text-main)" />}
          onClick={optOut}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
