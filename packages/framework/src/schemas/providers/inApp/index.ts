import { InAppProviderIdEnum } from '@novu/shared';
import { Schema } from '../../../types/schema.types';
import { novuInAppProviderSchemas } from './novu-inapp.schema';

export const inAppProviderSchemas = {
  novu: novuInAppProviderSchemas,
} as const satisfies Record<InAppProviderIdEnum, { output: Schema }>;
