import type { JsonSchema } from '../../../types/schema.types';

export const throttleOutputSchema = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    timeValue: { type: 'number' },
    timeUnit: {
      type: 'string',
      enum: ['seconds', 'minutes', 'hours', 'days'],
    },
  },
  required: ['amount', 'timeValue', 'timeUnit'],
  additionalProperties: false,
} as const satisfies JsonSchema;

export const throttleResultSchema = {
  type: 'object',
  properties: {
    throttled: { type: 'boolean' },
    currentCount: { type: 'number' },
  },
  required: ['throttled', 'currentCount'],
  additionalProperties: false,
} as const satisfies JsonSchema;

export const throttleActionSchemas = {
  output: throttleOutputSchema,
  result: throttleResultSchema,
};
