import { getV2 } from './api.client';
import type { StepDataDto } from '@novu/shared';

export const fetchStep = async ({
  workflowSlug,
  stepSlug,
}: {
  workflowSlug: string;
  stepSlug: string;
}): Promise<StepDataDto> => {
  const { data } = await getV2<{ data: StepDataDto }>(`/workflows/${workflowSlug}/steps/${stepSlug}`);

  return data;
};
