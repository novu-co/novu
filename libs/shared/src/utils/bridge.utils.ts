import { ButtonTypeEnum, IMessage, IMessageCTA, UrlTarget } from '../entities/messages';
import { ChannelCTATypeEnum, WorkflowTypeEnum } from '../types';

export const isBridgeWorkflow = (workflowType?: WorkflowTypeEnum): boolean => {
  return workflowType === WorkflowTypeEnum.BRIDGE || workflowType === WorkflowTypeEnum.ECHO;
};

/**
 * This typing already lives in @novu/framework, but due to a circular dependency, we currently
 * need to duplicate it here.
 *
 * TODO: reconsider the dependency tree between @novu/shared and @novu/framework and move this
 * function to be shared across all apps. We will likely want to create a separate package for
 * schemas and their inferred type definitions.
 */
type InAppOutput = {
  subject?: string;
  body: string;
  avatar?: string;
  primaryAction?: {
    label: string;
    redirect?: Redirect;
  };
  secondaryAction?: {
    label: string;
    redirect?: Redirect;
  };
  data?: Record<string, unknown>;
  redirect?: Redirect;
};

type Redirect = {
  url: string;
  target?: UrlTarget;
};

type InAppMessage = Pick<IMessage, 'subject' | 'content' | 'cta' | 'avatar'>;

/**
 * This function maps the V2 InAppOutput to the V1 MessageEntity.
 */
export const inAppMessageFromBridgeOutputs = (outputs?: InAppOutput) => {
  const cta = {
    type: ChannelCTATypeEnum.REDIRECT,
    data: {
      url: outputs?.redirect?.url,
      target: outputs?.redirect?.target,
    },
    action: {
      result: {},
      buttons: [
        ...(outputs?.primaryAction
          ? [
              {
                type: ButtonTypeEnum.PRIMARY,
                content: outputs.primaryAction.label,
                url: outputs.primaryAction.redirect?.url,
                target: outputs?.primaryAction.redirect?.target,
              },
            ]
          : []),
        ...(outputs?.secondaryAction
          ? [
              {
                type: ButtonTypeEnum.SECONDARY,
                content: outputs.secondaryAction.label,
                url: outputs.secondaryAction.redirect?.url,
                target: outputs?.secondaryAction.redirect?.target,
              },
            ]
          : []),
      ],
    },
  } satisfies IMessageCTA;

  return {
    subject: outputs?.subject,
    content: outputs?.body || '',
    cta,
    avatar: outputs?.avatar,
    data: outputs?.data,
  } satisfies InAppMessage;
};
