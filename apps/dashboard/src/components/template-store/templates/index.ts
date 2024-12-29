import { loginAlertTemplate } from './login-alert';
import { mentionNotificationTemplate } from './mention-notification';
import { paymentFailedTemplate } from './payment-failed';
import { teamInvitationTemplate } from './team-invitation';
import { trialExpirationTemplate } from './trial-expiration';
import { usageLimitTemplate } from './usage-limit';
import { WorkflowTemplate } from './types';

export function getTemplates(): WorkflowTemplate[] {
  return [
    mentionNotificationTemplate,
    loginAlertTemplate,
    trialExpirationTemplate,
    paymentFailedTemplate,
    teamInvitationTemplate,
    usageLimitTemplate,
  ];
}

export * from './types';
