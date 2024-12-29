import { z } from 'zod';
import { StepTypeEnum } from '@novu/shared';

export const emailContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(
    z.object({
      type: z.union([z.literal('paragraph'), z.literal('button')]),
      attrs: z.record(z.any()),
      content: z
        .array(
          z.object({
            type: z.union([z.literal('text'), z.literal('variable')]),
            text: z.string().optional(),
            attrs: z.record(z.any()).optional(),
          })
        )
        .optional(),
    })
  ),
});

export const stepSchema = z.object({
  name: z.string(),
  type: z.enum([
    StepTypeEnum.EMAIL,
    StepTypeEnum.IN_APP,
    StepTypeEnum.SMS,
    StepTypeEnum.PUSH,
    StepTypeEnum.CHAT,
    StepTypeEnum.DELAY,
  ]),
  subject: z.string().optional(),
  body: z.union([z.string(), emailContentSchema]).optional(),
  metadata: z
    .object({
      amount: z.number().optional(),
      unit: z.enum(['seconds', 'minutes', 'hours', 'days']).optional(),
      type: z.enum(['regular', 'scheduled']).optional(),
    })
    .optional(),
});

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['popular', 'events', 'authentication', 'social']),
  steps: z.array(stepSchema),
});
