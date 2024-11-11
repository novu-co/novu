import { UserButton } from '@clerk/clerk-react';
import { IconBolt } from '@novu/novui/icons';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { ROUTES } from '../../../constants/routes';
import { useNewDashboardOptIn } from '../../../hooks/useNewDashboardOptIn';
import { useFeatureFlag } from '../../../hooks';

export function UserProfileButton() {
  const { redirectToNewDashboard } = useNewDashboardOptIn();
  const isNewDashboardEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_ENABLED);

  return (
    <UserButton afterSignOutUrl={ROUTES.AUTH_LOGIN} userProfileUrl={ROUTES.MANAGE_ACCOUNT_USER_PROFILE}>
      {isNewDashboardEnabled && (
        <UserButton.MenuItems>
          <UserButton.Action
            label="Try out the new dashboard (beta)"
            labelIcon={<IconBolt size="16" color="var(--nv-colors-typography-text-main)" />}
            onClick={redirectToNewDashboard}
          />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
}
