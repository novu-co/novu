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

function sanitizeRedirect(redirect: Redirect) {
  if (!redirect.url || !redirect.target) {
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

function sanitizeInApp(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const normalized: Record<string, unknown> = {
    subject: controlValues.subject || null,
    body:
      (controlValues.body as string)?.length === 0
        ? WHITESPACE
        : controlValues.body,
    avatar: controlValues.avatar || null,
    primaryAction: null,
    secondaryAction: null,
    redirect: null,
    data: controlValues.data || null,
  };

  if (controlValues.primaryAction) {
    normalized.primaryAction = sanitizeAction(
      controlValues.primaryAction as Action,
    );
  }

  if (controlValues.secondaryAction) {
    normalized.secondaryAction = sanitizeAction(
      controlValues.secondaryAction as Action,
    );
  }

  if (controlValues.redirect) {
    normalized.redirect = sanitizeRedirect(controlValues.redirect as Redirect);
  }

  if (typeof normalized === 'object' && normalized !== null) {
    return Object.fromEntries(
      Object.entries(normalized).filter(([_, value]) => value !== null),
    );
  }

  return normalized;
}

function sanitizeEmail(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const emailControls: Record<string, unknown> = {};

  /*
   * if (controlValues.body != null) {
   *   emailControls.body = controlValues.body || '';
   * }
   */
  emailControls.subject = controlValues.subject || '';
  emailControls.body = controlValues.body || EMPTY_TIP_TAP_OBJECT;
  emailControls.data = controlValues.data || null;

  return emailControls;
}

function sanitizeSms(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  return {
    body: controlValues.body || '',
    data: controlValues.data || null,
  };
}

function sanitizePush(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const mappedValues = {
    subject: controlValues.subject || '',
    body: controlValues.body || '',
    data: controlValues.data || null,
  };

  if (typeof mappedValues === 'object' && mappedValues !== null) {
    return Object.fromEntries(
      Object.entries(mappedValues).filter(([_, value]) => value !== null),
    );
  }

  return mappedValues;
}

function sanitizeChat(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  return {
    body: controlValues.body || '',
    data: controlValues.data || null,
  };
}

function sanitizeDigest(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const mappedValues = {
    cron: controlValues.cron || '',
    amount: controlValues.amount || 0,
    unit: controlValues.unit || '',
    digestKey: controlValues.digestKey || '',
    data: controlValues.data || null,
    lookBackWindow: controlValues.lookBackWindow
      ? {
          amount: (controlValues.lookBackWindow as LookBackWindow).amount || 0,
          unit: (controlValues.lookBackWindow as LookBackWindow).unit || '',
        }
      : null,
  };

  if (typeof mappedValues === 'object' && mappedValues !== null) {
    return Object.fromEntries(
      Object.entries(mappedValues).filter(([_, value]) => value !== null),
    );
  }

  return mappedValues;
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
  stepType: string,
): Record<string, unknown> | null {
  if (!controlValues) {
    return null;
  }
  let normalizedValues: Record<string, unknown>;
  switch (stepType) {
    case 'in_app':
      normalizedValues = sanitizeInApp(controlValues);
      break;
    case 'email':
      normalizedValues = sanitizeEmail(controlValues);
      break;
    case 'sms':
      normalizedValues = sanitizeSms(controlValues);
      break;
    case 'push':
      normalizedValues = sanitizePush(controlValues);
      break;
    case 'chat':
      normalizedValues = sanitizeChat(controlValues);
      break;
    case 'digest':
      normalizedValues = sanitizeDigest(controlValues);
      break;
    default:
      normalizedValues = controlValues;
  }

  return normalizedValues;
}
