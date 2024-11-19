import { ShortIsPrefixEnum } from '@novu/shared';

export const WORKFLOW_DIVIDER = `_${ShortIsPrefixEnum.WORKFLOW}`;
export const STEP_DIVIDER = `_${ShortIsPrefixEnum.STEP}`;

export const getEncodedId = ({ slug, divider }: { slug: string; divider: string }) => {
  const parts = slug.split(divider);
  return parts[parts.length - 1];
};
