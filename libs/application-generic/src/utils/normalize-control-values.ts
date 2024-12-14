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

type Redirect = {
  url: string;
  target: '_self' | '_blank' | '_parent' | '_top' | '_unfencedTop';
};

type Action = {
  label: string;
  redirect: Redirect;
};

type LookBackWindow = {
  amount: number;
  unit: string;
};

function normalizeRedirect(redirect: Redirect) {
  if (!redirect) return null;

  return {
    url: redirect.url || null,
    target: redirect.target || '_self',
  };
}

function normalizeInAppControlValues(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const normalized: Record<string, unknown> = {
    subject: controlValues.subject || null,
    body: controlValues.body,
    avatar: controlValues.avatar || null,
    primaryAction: null,
    secondaryAction: null,
    redirect: null,
  };

  if (controlValues.primaryAction) {
    normalized.primaryAction = {
      label: (controlValues.primaryAction as Action).label || null,
      redirect: normalizeRedirect(
        (controlValues.primaryAction as Action).redirect,
      ),
    };
  }

  if (controlValues.secondaryAction) {
    normalized.secondaryAction = {
      label: (controlValues.secondaryAction as Action).label || null,
      redirect: normalizeRedirect(
        (controlValues.secondaryAction as Action).redirect,
      ),
    };
  }

  if (controlValues.redirect) {
    const redirect = normalizeRedirect(controlValues.redirect as Redirect);
    normalized.redirect = redirect?.url ? redirect : null;
  }

  if (typeof normalized === 'object' && normalized !== null) {
    return Object.fromEntries(
      Object.entries(normalized).filter(([_, value]) => value !== null),
    );
  }

  return normalized;
}

function normalizeEmailControlValues(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const emailControls: Record<string, unknown> = {};

  /*
   * if (controlValues.body != null) {
   *   emailControls.body = controlValues.body || '';
   * }
   */
  emailControls.subject = controlValues.subject || '';
  emailControls.emailEditor = controlValues.emailEditor || EMPTY_TIP_TAP_OBJECT;

  return emailControls;
}

function normalizeSmsControlValues(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  return {
    body: controlValues.body || '',
  };
}

function normalizePushControlValues(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const mappedValues = {
    subject: controlValues.subject || '',
    body: controlValues.body || '',
  };

  if (typeof mappedValues === 'object' && mappedValues !== null) {
    return Object.fromEntries(
      Object.entries(mappedValues).filter(([_, value]) => value !== null),
    );
  }

  return mappedValues;
}

function normalizeChatControlValues(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  return {
    body: controlValues.body || '',
  };
}

function normalizeDigestControlValues(controlValues: Record<string, unknown>) {
  if (!controlValues) return controlValues;

  const mappedValues = {
    cron: controlValues.cron || '',
    amount: controlValues.amount || 0,
    unit: controlValues.unit || '',
    digestKey: controlValues.digestKey || '',
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
 * Normalizes control values received from client-side forms into a clean minimal object.
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
 *   body: ""
 * }
 *
 */
export function normalizeControlValues(
  controlValues: Record<string, unknown>,
  stepType: string,
): Record<string, unknown> | null {
  if (!controlValues) {
    return null;
  }
  let normalizedValues: Record<string, unknown>;
  switch (stepType) {
    case 'in_app':
      normalizedValues = normalizeInAppControlValues(controlValues);
      break;
    case 'email':
      normalizedValues = normalizeEmailControlValues(controlValues);
      break;
    case 'sms':
      normalizedValues = normalizeSmsControlValues(controlValues);
      break;
    case 'push':
      normalizedValues = normalizePushControlValues(controlValues);
      break;
    case 'chat':
      normalizedValues = normalizeChatControlValues(controlValues);
      break;
    case 'digest':
      normalizedValues = normalizeDigestControlValues(controlValues);
      break;
    default:
      normalizedValues = controlValues;
  }

  return normalizedValues;
}
