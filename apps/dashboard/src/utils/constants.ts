import { StepTypeEnum } from '@novu/shared';

export const AUTOCOMPLETE_PASSWORD_MANAGERS_OFF = {
  autoComplete: 'off',
  'data-1p-ignore': true,
  'data-form-type': 'other',
};

export const UNSUPPORTED_STEP_TYPES: readonly StepTypeEnum[] = [
  StepTypeEnum.DIGEST,
  StepTypeEnum.TRIGGER,
  StepTypeEnum.CUSTOM,
];

export const INLINE_CONFIGURABLE_STEP_TYPES: readonly StepTypeEnum[] = [StepTypeEnum.DELAY];

export const TEMPLATE_CONFIGURABLE_STEP_TYPES: readonly StepTypeEnum[] = [StepTypeEnum.IN_APP, StepTypeEnum.EMAIL];
