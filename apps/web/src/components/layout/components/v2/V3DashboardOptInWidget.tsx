import { Card } from '@mantine/core';
import { css } from '@novu/novui/css';
import { Text, Title, Button, IconButton } from '@novu/novui';
import { IconOutlineClose } from '@novu/novui/icons';
import { useUser } from '@clerk/clerk-react';
import { FeatureFlagsKeysEnum, V3DashboardOptInStatusEnum } from '@novu/shared';
import { IS_SELF_HOSTED } from '../../../../config';
import { useFeatureFlag } from '../../../../hooks';

export function V3DashboardOptInWidget() {
  const { user } = useUser();
  const isV3DashboardEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_V3_DASHBOARD_ENABLED);

  const isDismissed = user?.unsafeMetadata?.v3DashboardOptInStatus === V3DashboardOptInStatusEnum.DISMISSED;

  if (IS_SELF_HOSTED || isDismissed || !isV3DashboardEnabled) {
    return null;
  }

  const updateUserOptInStatus = (status: V3DashboardOptInStatusEnum) => {
    if (!user) return;

    user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        v3DashboardOptInStatus: status,
      },
    });
  };

  function handleOptIn() {
    const v3DashboardUrl = process.env.V3_DASHBOARD_URL;
    if (!v3DashboardUrl || !user) return;

    updateUserOptInStatus(V3DashboardOptInStatusEnum.OPTED_IN);
    window.location.href = v3DashboardUrl;
  }

  function handleDismiss() {
    updateUserOptInStatus(V3DashboardOptInStatusEnum.DISMISSED);
  }

  return (
    <Card shadow="sm" className={styles.card}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Title className={styles.title}>
            <span style={{ marginRight: '4px' }}>🎉</span> You're invited!
          </Title>
          <IconButton onClick={handleDismiss} Icon={IconOutlineClose} size="xs" />
        </div>
        <Text className={styles.text}>
          We’d love to extend you the access for the new workflows dashboard that we’re building.
        </Text>
      </div>
      <div className={styles.buttonContainer}>
        <Button size="sm" variant="transparent" onClick={handleOptIn}>
          Take me there
        </Button>
      </div>
    </Card>
  );
}

const styles = {
  card: css({
    padding: '9px 16px !important',
    backgroundColor: 'surface.popover !important',
    _before: {
      content: '""',
      position: 'absolute',
      width: '50',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      borderTopLeftRadius: '100',
      borderBottomLeftRadius: '100',
      bgGradient: `to-b`,
      gradientFrom: 'colorPalette.start',
      gradientTo: 'colorPalette.end',
    },
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignSelf: 'stretch',
  }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  }),
  title: css({
    fontSize: '12px',
    fontWeight: '700 ',
    lineHeight: '20px',
  }),
  text: css({
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '500',
    fontStyle: 'normal',
  }),
  buttonContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
};
