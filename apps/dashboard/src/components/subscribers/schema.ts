import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const SubscriberFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: 'Invalid phone number' })
    .optional()
    .or(z.literal(''))
    .optional(),
  avatar: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  data: z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Custom data must be valid JSON' });
        return z.NEVER;
      }
    })
    .optional(),
});
