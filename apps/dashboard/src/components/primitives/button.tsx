// AlignUI Button v0.0.0

import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';

import { IconType } from 'react-icons';

import type { PolymorphicComponentProps } from '@/utils/polymorphic';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import { tv, type VariantProps } from '@/utils/tv';

const BUTTON_ROOT_NAME = 'ButtonRoot';
const BUTTON_ICON_NAME = 'ButtonIcon';

export const buttonVariants = tv({
  slots: {
    root: [
      // base
      'group relative inline-flex items-center justify-center whitespace-nowrap outline-none',
      'transition duration-200 ease-out',
      // focus
      'focus:outline-none',
      // disabled
      'disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:ring-transparent',
    ],
    icon: [
      // base
      'flex size-5 shrink-0 items-center justify-center',
    ],
  },
  variants: {
    variant: {
      primary: {},
      secondary: {},
      error: {},
    },
    mode: {
      filled: {},
      outline: {
        root: 'ring-1 ring-inset',
      },
      lighter: {
        root: 'ring-1 ring-inset',
      },
      ghost: {
        root: 'ring-1 ring-inset',
      },
    },
    size: {
      md: {
        root: 'h-10 gap-3 rounded-10 px-3.5 text-label-sm',
        icon: '-mx-1',
      },
      sm: {
        root: 'h-9 gap-3 rounded-lg px-3 text-label-sm',
        icon: '-mx-1',
      },
      xs: {
        root: 'h-8 gap-2.5 rounded-lg px-2.5 text-label-sm',
        icon: '-mx-1',
      },
      '2xs': {
        root: 'h-7 gap-2.5 rounded-lg px-2 text-label-sm',
        icon: '-mx-1',
      },
    },
  },
  compoundVariants: [
    //#region variant=primary
    {
      variant: 'primary',
      mode: 'filled',
      class: {
        root: [
          // base
          'bg-primary-base text-static-white',
          // hover
          'hover:bg-primary-darker',
          // focus
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'outline',
      class: {
        root: [
          // base
          'bg-bg-white-0 text-primary-base ring-primary-base',
          // hover
          'hover:bg-primary-alpha-10 hover:ring-transparent',
          // focus
          'focus-visible:shadow-button-primary-focus',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'lighter',
      class: {
        root: [
          // base
          'bg-primary-alpha-10 text-primary-base ring-transparent',
          // hover
          'hover:bg-bg-white-0 hover:ring-primary-base',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:shadow-button-primary-focus focus-visible:ring-primary-base',
        ],
      },
    },
    {
      variant: 'primary',
      mode: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-primary-base ring-transparent',
          // hover
          'hover:bg-primary-alpha-10',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:shadow-button-primary-focus focus-visible:ring-primary-base',
        ],
      },
    },
    //#endregion

    //#region variant=neutral
    {
      variant: 'secondary',
      mode: 'filled',
      class: {
        root: [
          // base
          'bg-bg-strong-950 text-text-white-0',
          // hover
          'hover:bg-bg-surface-800',
          // focus
          'focus-visible:shadow-button-important-focus',
        ],
      },
    },
    {
      variant: 'secondary',
      mode: 'outline',
      class: {
        root: [
          // base
          'bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-stroke-soft-200',
          // hover
          'hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent',
          // focus
          'focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong-950',
        ],
      },
    },
    {
      variant: 'secondary',
      mode: 'lighter',
      class: {
        root: [
          // base
          'bg-bg-weak-50 text-text-sub-600 ring-transparent',
          // hover
          'hover:bg-bg-white-0 hover:text-text-strong-950 hover:shadow-regular-xs hover:ring-stroke-soft-200',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong-950',
        ],
      },
    },
    {
      variant: 'secondary',
      mode: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-text-sub-600 ring-transparent',
          // hover
          'hover:bg-bg-weak-50 hover:text-text-strong-950',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus focus-visible:ring-stroke-strong-950',
        ],
      },
    },
    //#endregion

    //#region variant=error
    {
      variant: 'error',
      mode: 'filled',
      class: {
        root: [
          // base
          'bg-error-base text-static-white',
          // hover
          'hover:bg-red-700',
          // focus
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'outline',
      class: {
        root: [
          // base
          'bg-bg-white-0 text-error-base ring-error-base',
          // hover
          'hover:bg-red-alpha-10 hover:ring-transparent',
          // focus
          'focus-visible:shadow-button-error-focus',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'lighter',
      class: {
        root: [
          // base
          'bg-red-alpha-10 text-error-base ring-transparent',
          // hover
          'hover:bg-bg-white-0 hover:ring-error-base',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:shadow-button-error-focus focus-visible:ring-error-base',
        ],
      },
    },
    {
      variant: 'error',
      mode: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-error-base ring-transparent',
          // hover
          'hover:bg-red-alpha-10',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:shadow-button-error-focus focus-visible:ring-error-base',
        ],
      },
    },
    //#endregion
  ],
  defaultVariants: {
    variant: 'primary',
    mode: 'filled',
    size: 'sm',
  },
});

type ButtonSharedProps = VariantProps<typeof buttonVariants>;

export type ButtonRootProps = VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isLoading?: boolean;
  };

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  ({ children, variant, mode, size, asChild, isLoading, className, ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';
    const { root } = buttonVariants({ variant, mode, size });

    const sharedProps: ButtonSharedProps = {
      variant,
      mode,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BUTTON_ICON_NAME],
      uniqueId,
      asChild
    );

    return (
      <Component ref={forwardedRef} className={root({ class: className })} type="button" {...rest}>
        {extendedChildren}
      </Component>
    );
  }
);
ButtonRoot.displayName = BUTTON_ROOT_NAME;

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ButtonRoot> & {
    leadingIcon?: IconType;
    trailingIcon?: IconType;
  }
>(({ children, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, ...rest }, forwardedRef) => {
  return (
    <ButtonRoot ref={forwardedRef} {...rest}>
      {LeadingIcon && <ButtonIcon as={LeadingIcon} />}
      <Slottable>{children}</Slottable>
      {TrailingIcon && <ButtonIcon as={TrailingIcon} />}
    </ButtonRoot>
  );
});
Button.displayName = 'Button';

function ButtonIcon<T extends React.ElementType>({
  variant,
  mode,
  size,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, ButtonSharedProps>) {
  const Component = as || 'div';
  const { icon } = buttonVariants({ mode, variant, size });

  return <Component className={icon({ class: className })} {...rest} />;
}
ButtonIcon.displayName = BUTTON_ICON_NAME;

export { ButtonRoot as Root, ButtonIcon as ButtonIcon, Button };
