import { UserButton } from '@clerk/clerk-react';
import { IconBolt } from '@novu/novui/icons';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { ROUTES } from '../../../constants/routes';
import { useNewDashboardOptIn } from '../../../hooks/useNewDashboardOptIn';
import { useFeatureFlag } from '../../../hooks';
import { WEB_APP_URL } from '../../../config';

export function UserProfileButton() {
  const { optIn } = useNewDashboardOptIn();
  const isNewDashboardEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_ENABLED);
  const isV2Enabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_V2_ENABLED);

  return (
    <UserButton
      afterSignOutUrl={`${WEB_APP_URL}${ROUTES.AUTH_LOGIN}`}
      userProfileUrl={ROUTES.MANAGE_ACCOUNT_USER_PROFILE}
    >
      {isNewDashboardEnabled && isV2Enabled && (
        <UserButton.MenuItems>
          <UserButton.Action
            label="Try out the new Dashboard (beta)"
            labelIcon={<IconBolt size="16" color="var(--nv-colors-typography-text-main)" />}
            onClick={optIn}
          />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
}
