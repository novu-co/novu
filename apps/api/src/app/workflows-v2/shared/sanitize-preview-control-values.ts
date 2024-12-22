import { StepTypeEnum, TimeUnitEnum } from '@novu/shared';
import { isEmpty } from 'lodash';
import { EmailStepControlType, InAppControlType } from './schemas';
import { SmsStepControlType } from './schemas/sms-control.schema';
import { ChatStepControlType } from './schemas/chat-control.schema';
import { DelayTimeControlType } from './schemas/delay-control.schema';
import {
  DigestControlSchemaType,
  DigestRegularControlType,
  DigestTimedControlType,
  isDigestRegularControl,
  isDigestTimedControl,
} from './schemas/digest-control.schema';
import { PushStepControlType } from './schemas/push-control.schema';

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
const WHITESPACE = ' ';

type Redirect = {
  url: string;
  target: '_self' | '_blank' | '_parent' | '_top' | '_unfencedTop';
};

type Action = {
  label?: string;
  redirect?: Redirect;
};

type LookBackWindow = {
  amount: number;
  unit: string;
};

function sanitizeRedirect(redirect: Redirect | undefined) {
  if (!redirect?.url || !redirect?.target) {
    return undefined;
  }

  return {
    url: redirect.url || 'https://example.com',
    target: redirect.target || '_self',
  };
}

function sanitizeAction(action: Action) {
  if (!action?.label) {
    return undefined;
  }

  return {
    label: action.label,
    redirect: sanitizeRedirect(action.redirect),
  };
}

function sanitizeInApp(controlValues: InAppControlType) {
  const normalized: InAppControlType = {
    subject: controlValues.subject || undefined,
    body: isEmpty(controlValues.body) ? WHITESPACE : controlValues.body,
    avatar: controlValues.avatar || undefined,
    primaryAction: null,
    secondaryAction: null,
    redirect: null,
    data: controlValues.data || undefined,
    skip: controlValues.skip || undefined,
  };

  if (controlValues.primaryAction) {
    normalized.primaryAction = sanitizeAction(controlValues.primaryAction as Action);
  }

  if (controlValues.secondaryAction) {
    normalized.secondaryAction = sanitizeAction(controlValues.secondaryAction as Action);
  }

  if (controlValues.redirect) {
    normalized.redirect = sanitizeRedirect(controlValues.redirect as Redirect);
  }

  return filterNullishValues(normalized);
}

function sanitizeEmail(controlValues: EmailStepControlType) {
  const emailControls: EmailStepControlType = {
    subject: controlValues.subject || '',
    body: controlValues.body || EMPTY_TIP_TAP_OBJECT,
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(emailControls);
}

function sanitizeSms(controlValues: SmsStepControlType) {
  const mappedValues: SmsStepControlType = {
    body: controlValues.body || '',
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(mappedValues);
}

function sanitizePush(controlValues: PushStepControlType) {
  const mappedValues: PushStepControlType = {
    subject: controlValues.subject || '',
    body: controlValues.body || '',
    skip: controlValues.skip || undefined,
  };

  return filterNullishValues(mappedValues);
}

function sanitizeChat(controlValues: ChatStepControlType) {
  const mappedValues: ChatStepControlType = {
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
            amount: (controlValues.lookBackWindow as LookBackWindow).amount || 0,
            unit: ((controlValues.lookBackWindow as LookBackWindow).unit as TimeUnitEnum) || TimeUnitEnum.SECONDS,
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
          amount: (anyControlValues.lookBackWindow as LookBackWindow).amount || 0,
          unit: ((anyControlValues.lookBackWindow as LookBackWindow).unit as TimeUnitEnum) || TimeUnitEnum.SECONDS,
        }
      : undefined,
  });
}

function sanitizeDelay(controlValues: DelayTimeControlType) {
  const mappedValues: DelayTimeControlType = {
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
export function sanitizePreviewControlValues(
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
      normalizedValues = sanitizeEmail(controlValues as EmailStepControlType);
      break;
    case StepTypeEnum.SMS:
      normalizedValues = sanitizeSms(controlValues as SmsStepControlType);
      break;
    case StepTypeEnum.PUSH:
      normalizedValues = sanitizePush(controlValues as PushStepControlType);
      break;
    case StepTypeEnum.CHAT:
      normalizedValues = sanitizeChat(controlValues as ChatStepControlType);
      break;
    case StepTypeEnum.DIGEST:
      normalizedValues = sanitizeDigest(controlValues as DigestControlSchemaType);
      break;
    case StepTypeEnum.DELAY:
      normalizedValues = sanitizeDelay(controlValues as DelayTimeControlType);
      break;
    default:
      normalizedValues = filterNullishValues(controlValues);
  }

  return normalizedValues;
}
