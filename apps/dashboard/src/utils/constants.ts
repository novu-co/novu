import { StepTypeEnum } from '@novu/shared';

export const AUTOCOMPLETE_PASSWORD_MANAGERS_OFF = {
  autoComplete: 'off',
  'data-1p-ignore': true,
  'data-form-type': 'other',
};

export const EXCLUDED_EDITOR_TYPES: string[] = [StepTypeEnum.DIGEST, StepTypeEnum.TRIGGER, StepTypeEnum.CUSTOM];
