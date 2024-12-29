import { z } from 'zod';
import { StepTypeEnum } from '@novu/shared';

export const emailStepSchema = z.object({
  type: z.literal(StepTypeEnum.EMAIL),
  name: z.string(),
  subject: z.string(),
  content: z.array(
    z.object({
      type: z.enum(['text', 'variable', 'paragraph', 'button']),
      text: z.string(),
    })
  ),
});

export const inAppStepSchema = z.object({
  type: z.literal(StepTypeEnum.IN_APP),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
});

export const smsStepSchema = z.object({
  type: z.literal(StepTypeEnum.SMS),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
});

export const pushStepSchema = z.object({
  type: z.literal(StepTypeEnum.PUSH),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
});

export const chatStepSchema = z.object({
  type: z.literal(StepTypeEnum.CHAT),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
});

export const delayStepSchema = z.object({
  type: z.literal(StepTypeEnum.DELAY),
  name: z.string(),
  metadata: z.object({
    amount: z.number(),
    unit: z.enum(['seconds', 'minutes', 'hours', 'days']),
    type: z.enum(['regular', 'scheduled']),
  }),
});

export const stepSchema = z.discriminatedUnion('type', [
  emailStepSchema,
  inAppStepSchema,
  smsStepSchema,
  pushStepSchema,
  chatStepSchema,
  delayStepSchema,
]);

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['popular', 'events', 'authentication', 'social']),
  steps: z.array(stepSchema),
});
