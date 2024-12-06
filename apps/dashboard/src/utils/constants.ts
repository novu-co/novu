import { StepTypeEnum } from '@novu/shared';

export const AUTOCOMPLETE_PASSWORD_MANAGERS_OFF = {
  autoComplete: 'off',
  'data-1p-ignore': true,
  'data-form-type': 'other',
};

export const INLINE_CONFIGURABLE_STEP_TYPES: readonly StepTypeEnum[] = [StepTypeEnum.DELAY];

export const TEMPLATE_CONFIGURABLE_STEP_TYPES: readonly StepTypeEnum[] = [
  StepTypeEnum.IN_APP,
  StepTypeEnum.EMAIL,
  StepTypeEnum.SMS,
  StepTypeEnum.CHAT,
  StepTypeEnum.PUSH,
];
