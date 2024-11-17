import { ActionStepEnum, actionStepSchemas } from '@novu/framework/internal';
import { DigestUnitEnum, JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

const delayUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.DELAY,
  properties: {
    amount: {
      component: UiComponentEnum.DELAY_AMOUNT,
      placeholder: '30',
    },
    unit: {
      component: UiComponentEnum.DELAY_UNIT,
      placeholder: DigestUnitEnum.SECONDS,
    },
    type: {
      component: UiComponentEnum.DELAY_TYPE,
      placeholder: null,
    },
  },
};

export const delayControlSchema = {
  schema: actionStepSchemas[ActionStepEnum.DELAY].output as unknown as JSONSchemaDto,
  uiSchema: delayUiSchema,
};
