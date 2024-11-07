import { UiComponentEnum } from '@novu/shared';

import { InAppAction } from '@/components/workflow-editor/steps/in-app/in-app-action';
import { InAppSubject } from '@/components/workflow-editor/steps/in-app/in-app-subject';
import { InAppBody } from '@/components/workflow-editor/steps/in-app/in-app-body';
import { InAppAvatar } from '@/components/workflow-editor/steps/in-app/in-app-avatar';
import { InAppRedirect } from '@/components/workflow-editor/steps/in-app/in-app-redirect';

export const getComponentByType = ({ component }: { component?: UiComponentEnum }) => {
  switch (component) {
    case UiComponentEnum.IN_APP_AVATAR: {
      return <InAppAvatar />;
    }
    case UiComponentEnum.IN_APP_SUBJECT: {
      return <InAppSubject />;
    }
    case UiComponentEnum.IN_APP_BODY: {
      return <InAppBody />;
    }
    case UiComponentEnum.IN_APP_BUTTON_DROPDOWN: {
      return <InAppAction />;
    }
    case UiComponentEnum.URL_TEXT_BOX: {
      return <InAppRedirect />;
    }
    default: {
      return null;
    }
  }
};
