import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { borderRadii, shadows, texts } from '../../tailwind.config';

export { type ClassValue } from 'clsx';

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [
        {
          text: Object.keys(texts),
        },
      ],
      shadow: [
        {
          shadow: Object.keys(shadows),
        },
      ],
      rounded: [
        {
          rounded: Object.keys(borderRadii),
        },
      ],
    },
  },
};

const customTwMerge = extendTailwindMerge(twMergeConfig);

/**
 * Utilizes `clsx` with `tailwind-merge`, use in cases of possible class conflicts.
 */
export function cnExt(...classes: ClassValue[]) {
  return customTwMerge(clsx(...classes));
}

/**
 * A direct export of `clsx` without `tailwind-merge`.
 */
export const cn = clsx;
