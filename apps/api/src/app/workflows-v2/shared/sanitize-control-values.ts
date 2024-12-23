import { StepTypeEnum, TimeUnitEnum } from '@novu/shared';
import { isEmpty } from 'lodash';
import { SmsControlType } from './schemas/sms-control.schema';
import { ChatControlType } from './schemas/chat-control.schema';
import { DelayControlType } from './schemas/delay-control.schema';
import {
  DigestControlSchemaType,
  DigestRegularControlType,
  DigestTimedControlType,
  isDigestRegularControl,
  isDigestTimedControl,
  LookBackWindowType,
} from './schemas/digest-control.schema';
import { PushControlType } from './schemas/push-control.schema';
import { InAppActionType, InAppControlType, InAppRedirectType } from './schemas/in-app-control.schema';
import { EmailControlType } from './schemas/email-control.schema';

const EMPTY_TIP_TAP_OBJECT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [{ type: 'text', text: ' ' }],
    },
  ],
});

function sanitizeRedirect(redirect: InAppRedirectType | undefined, isOptional: boolean = false) {
  if (isOptional && (!redirect?.url || !redirect?.target)) {
    return undefined;
  }

  return {
    url: redirect?.url as string,
    target: redirect?.target as '_self' | '_blank' | '_parent' | '_top' | '_unfencedTop',
  };
}

function sanitizeAction(action: InAppActionType) {
  if (!action?.label && !action?.redirect?.url && !action?.redirect?.target && !action?.redirect) {
    return undefined;
  }

  return {
    label: action.label as string,
    redirect: sanitizeRedirect(action.redirect) as InAppRedirectType,
  };
}

function sanitizeInApp(controlValues: InAppControlType) {
  const normalized: InAppControlType = {
    subject: controlValues.subject || undefined,
    // Cast to string to trigger Ajv validation errors
    body: isEmpty(controlValues.body) ? (undefined as unknown as string) : controlValues.body,
    avatar: controlValues.avatar || undefined,
    primaryAction: undefined,
    secondaryAction: undefined,
    redirect: undefined,
    data: controlValues.data || undefined,
    skip: controlValues.skip || undefined,
  };

  if (controlValues.primaryAction) {
    normalized.primaryAction = sanitizeAction(controlValues.primaryAction as InAppActionType);
  }

  if (controlValues.secondaryAction) {
    normalized.secondaryAction = sanitizeAction(controlValues.secondaryAction as InAppActionType);
  }

  if (controlValues.redirect) {
    normalized.redirect = sanitizeRedirect(controlValues.redirect as InAppRedirectType, true);
  }

  return filterNullishValues(normalized);
}

function sanitizeEmail(controlValues: EmailControlType) {
  const emailControls: EmailControlType = {
    subject: controlValues.subject || '',
    body: controlValues.body || EMPTY_TIP_TAP_OBJECT,
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(emailControls);
}

function sanitizeSms(controlValues: SmsControlType) {
  const mappedValues: SmsControlType = {
    body: controlValues.body || '',
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(mappedValues);
}

function sanitizePush(controlValues: PushControlType) {
  const mappedValues: PushControlType = {
    subject: controlValues.subject || '',
    body: controlValues.body || '',
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(mappedValues);
}

function sanitizeChat(controlValues: ChatControlType) {
  const mappedValues: ChatControlType = {
    body: controlValues.body || '',
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(mappedValues);
}

function sanitizeDigest(controlValues: DigestControlSchemaType) {
  if (isDigestTimedControl(controlValues)) {
    const mappedValues: DigestTimedControlType = {
      cron: controlValues.cron || '',
      digestKey: controlValues.digestKey || '',
      skip: controlValues.skip || undefined,
    };

    return filterNullishValues(mappedValues);
  }

  if (isDigestRegularControl(controlValues)) {
    const mappedValues: DigestRegularControlType = {
      amount: controlValues.amount || 0,
      unit: controlValues.unit || TimeUnitEnum.SECONDS,
      digestKey: controlValues.digestKey || '',
      skip: controlValues.skip || undefined,
      lookBackWindow: controlValues.lookBackWindow
        ? {
            amount: (controlValues.lookBackWindow as LookBackWindowType).amount || 0,
            unit: (controlValues.lookBackWindow as LookBackWindowType).unit || TimeUnitEnum.SECONDS,
          }
        : undefined,
    };

    return filterNullishValues(mappedValues);
  }

  const anyControlValues = controlValues as Record<string, unknown>;

  return filterNullishValues({
    amount: anyControlValues.amount || 0,
    unit: anyControlValues.unit || TimeUnitEnum.SECONDS,
    digestKey: anyControlValues.digestKey || '',
    skip: anyControlValues.skip || undefined,
    lookBackWindow: anyControlValues.lookBackWindow
      ? {
          amount: (anyControlValues.lookBackWindow as LookBackWindowType).amount || 0,
          unit: (anyControlValues.lookBackWindow as LookBackWindowType).unit || TimeUnitEnum.SECONDS,
        }
      : undefined,
  });
}

function sanitizeDelay(controlValues: DelayControlType) {
  const mappedValues: DelayControlType = {
    type: controlValues.type || 'regular',
    amount: controlValues.amount || 0,
    unit: controlValues.unit || TimeUnitEnum.SECONDS,
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(mappedValues);
}

function filterNullishValues<T extends Record<string, unknown>>(obj: T): T {
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)) as T;
  }

  return obj;
}

/**
 * Sanitizes control values received from client-side forms into a clean minimal object.
 * This function processes potentially invalid form data that may contain default/placeholder values
 * and transforms it into a standardized format suitable for preview generation.
 *
 * @example
 * // Input from form with default values:
 * {
 *   subject: "Hello",
 *   body: null,
 *   unusedField: "test"
 * }
 *
 * // Normalized output:
 * {
 *   subject: "Hello",
 *   body: " "
 * }
 *
 */
export function dashboardSanitizeControlValues(
  controlValues: Record<string, unknown>,
  stepType: StepTypeEnum
): Record<string, unknown> | null {
  if (!controlValues) {
    return null;
  }
  let normalizedValues: Record<string, unknown>;
  switch (stepType) {
    case StepTypeEnum.IN_APP:
      normalizedValues = sanitizeInApp(controlValues as InAppControlType);
      break;
    case StepTypeEnum.EMAIL:
      normalizedValues = sanitizeEmail(controlValues as EmailControlType);
      break;
    case StepTypeEnum.SMS:
      normalizedValues = sanitizeSms(controlValues as SmsControlType);
      break;
    case StepTypeEnum.PUSH:
      normalizedValues = sanitizePush(controlValues as PushControlType);
      break;
    case StepTypeEnum.CHAT:
      normalizedValues = sanitizeChat(controlValues as ChatControlType);
      break;
    case StepTypeEnum.DIGEST:
      normalizedValues = sanitizeDigest(controlValues as DigestControlSchemaType);
      break;
    case StepTypeEnum.DELAY:
      normalizedValues = sanitizeDelay(controlValues as DelayControlType);
      break;
    default:
      normalizedValues = filterNullishValues(controlValues);
  }

  return normalizedValues;
}
