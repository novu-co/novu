import { ShortIsPrefixEnum, StepResponseDto } from '@novu/shared';

const divider = `_${ShortIsPrefixEnum.STEP}`;

export const getStepBase62Id = (slug: StepResponseDto['slug'] | string = divider) => {
  const parts = slug.split(divider);
  return parts[parts.length - 1];
};
