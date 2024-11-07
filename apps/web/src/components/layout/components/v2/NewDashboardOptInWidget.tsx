import { Card } from '@mantine/core';
import { css } from '@novu/novui/css';
import { Text, Title, Button, IconButton } from '@novu/novui';
import { IconOutlineClose } from '@novu/novui/icons';
import { useUser } from '@clerk/clerk-react';
import { FeatureFlagsKeysEnum, NewDashboardOptInStatusEnum } from '@novu/shared';
import { IS_SELF_HOSTED } from '../../../../config';
import { useFeatureFlag } from '../../../../hooks';

export function NewDashboardOptInWidget() {
  const { user } = useUser();
  const isNewDashboardEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_ENABLED);

  const isDismissed = user?.unsafeMetadata?.newDashboardOptInStatus === NewDashboardOptInStatusEnum.DISMISSED;

  if (IS_SELF_HOSTED || isDismissed || !isNewDashboardEnabled) {
    return null;
  }

  const updateUserOptInStatus = (status: NewDashboardOptInStatusEnum) => {
    if (!user) return;

    user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        newDashboardOptInStatus: status,
      },
    });
  };

  function handleOptIn() {
    const newDashboardUrl = process.env.NEW_DASHBOARD_URL;
    if (!newDashboardUrl || !user) return;

    updateUserOptInStatus(NewDashboardOptInStatusEnum.OPTED_IN);
    window.location.href = newDashboardUrl;
  }

  function handleDismiss() {
    updateUserOptInStatus(NewDashboardOptInStatusEnum.DISMISSED);
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
