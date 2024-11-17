import { ActionStepEnum, actionStepSchemas } from '@novu/framework/internal';
import { DigestUnitEnum, JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

const digestUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.DIGEST,
  properties: {
    amount: {
      component: UiComponentEnum.DIGEST_AMOUNT,
      placeholder: '30',
    },
    unit: {
      component: UiComponentEnum.DIGEST_UNIT,
      placeholder: DigestUnitEnum.SECONDS,
    },
    digestKey: {
      component: UiComponentEnum.DIGEST_KEY,
      placeholder: null,
    },
    cron: {
      component: UiComponentEnum.DIGEST_CRON,
      placeholder: null,
    },
  },
};

export const digestControlSchema = {
  schema: actionStepSchemas[ActionStepEnum.DIGEST].output as unknown as JSONSchemaDto,
  uiSchema: digestUiSchema,
};
