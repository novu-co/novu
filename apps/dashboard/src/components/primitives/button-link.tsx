import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { PolymorphicComponentProps } from '@/utils/polymorphic';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import { tv, type VariantProps } from '@/utils/tv';

const LINK_BUTTON_ROOT_NAME = 'LinkButtonRoot';
const LINK_BUTTON_ICON_NAME = 'LinkButtonIcon';

export const linkButtonVariants = tv({
  slots: {
    root: [
      // base
      'group inline-flex items-center justify-center whitespace-nowrap outline-none',
      'transition duration-200 ease-out',
      'underline decoration-transparent underline-offset-[3px]',
      // hover
      'hover:decoration-current',
      // focus
      'focus:outline-none focus-visible:underline',
      // disabled
      'disabled:pointer-events-none disabled:text-text-disabled-300 disabled:no-underline',
    ],
    icon: 'shrink-0',
  },
  variants: {
    variant: {
      gray: {
        root: [
          // base
          'text-text-sub-600',
          // focus
          'focus-visible:text-text-strong-950',
        ],
      },
      black: {
        root: 'text-text-strong-950',
      },
      primary: {
        root: [
          // base
          'text-primary-base',
          // hover
          'hover:text-primary-darker',
        ],
      },
      error: {
        root: [
          // base
          'text-error-base',
          // hover
          'hover:text-red-700',
        ],
      },
      modifiable: {},
    },
    size: {
      md: {
        root: 'h-5 gap-1 text-label-sm',
        icon: 'size-5',
      },
      sm: {
        root: 'h-4 gap-1 text-label-xs',
        icon: 'size-4',
      },
    },
    underline: {
      true: {
        root: 'decoration-current',
      },
    },
  },
  defaultVariants: {
    variant: 'gray',
    size: 'md',
  },
});

type LinkButtonSharedProps = VariantProps<typeof linkButtonVariants>;

type LinkButtonProps = VariantProps<typeof linkButtonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const LinkButtonRoot = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ asChild, children, variant, size, underline, className, ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';
    const { root } = linkButtonVariants({ variant, size, underline });

    const sharedProps: LinkButtonSharedProps = {
      variant,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [LINK_BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component ref={forwardedRef} className={root({ class: className })} {...rest}>
        {extendedChildren}
      </Component>
    );
  }
);
LinkButtonRoot.displayName = LINK_BUTTON_ROOT_NAME;

function LinkButtonIcon<T extends React.ElementType>({
  className,
  variant,
  size,
  as,
  ...rest
}: PolymorphicComponentProps<T, LinkButtonSharedProps>) {
  const Component = as || 'div';
  const { icon } = linkButtonVariants({ variant, size });

  return <Component className={icon({ class: className })} {...rest} />;
}
LinkButtonIcon.displayName = LINK_BUTTON_ICON_NAME;

export { LinkButtonRoot as Root, LinkButtonIcon as LinkButtonIcon, LinkButtonRoot as LinkButton };
