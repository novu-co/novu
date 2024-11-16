import { WorkflowTypeEnum } from '@novu/shared';
import { Schema } from 'mongoose';

const variantSchemePart = {
  shortId: Schema.Types.String,
  active: {
    type: Schema.Types.Boolean,
    default: true,
  },
  replyCallback: {
    active: Schema.Types.Boolean,
    url: Schema.Types.String,
  },
  shouldStopOnFail: {
    type: Schema.Types.Boolean,
    default: false,
  },
  issues: Schema.Types.Mixed,
  uuid: Schema.Types.String,
  stepId: Schema.Types.String,
  name: Schema.Types.String,
  type: {
    type: Schema.Types.String,
    default: WorkflowTypeEnum.REGULAR,
  },
  filters: [
    {
      isNegated: Schema.Types.Boolean,
      type: {
        type: Schema.Types.String,
      },
      value: Schema.Types.String,
      children: [
        {
          field: Schema.Types.String,
          value: Schema.Types.Mixed,
          operator: Schema.Types.String,
          on: Schema.Types.String,
          webhookUrl: Schema.Types.String,
          timeOperator: Schema.Types.String,
          step: Schema.Types.String,
          stepType: Schema.Types.String,
        },
      ],
    },
  ],
  _templateId: {
    type: Schema.Types.ObjectId,
    ref: 'MessageTemplate',
  },
  _parentId: {
    type: Schema.Types.ObjectId,
  },
  metadata: {
    amount: {
      type: Schema.Types.Number,
    },
    unit: {
      type: Schema.Types.String,
    },
    digestKey: {
      type: Schema.Types.String,
    },
    delayPath: {
      type: Schema.Types.String,
    },
    type: {
      type: Schema.Types.String,
    },
    backoffUnit: {
      type: Schema.Types.String,
    },
    backoffAmount: {
      type: Schema.Types.Number,
    },
    updateMode: {
      type: Schema.Types.Boolean,
    },
    backoff: {
      type: Schema.Types.Boolean,
    },
    timed: {
      atTime: {
        type: Schema.Types.String,
      },
      weekDays: [Schema.Types.String],
      monthDays: [Schema.Types.Number],
      ordinal: {
        type: Schema.Types.String,
      },
      ordinalValue: {
        type: Schema.Types.String,
      },
      monthlyType: {
        type: Schema.Types.String,
      },
    },
  },
};

export const stepSchema = {
  ...variantSchemePart,
  variants: [variantSchemePart],
};
