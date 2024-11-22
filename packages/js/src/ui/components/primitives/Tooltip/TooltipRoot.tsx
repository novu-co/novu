import { autoUpdate, flip, offset, type Placement, shift } from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';
import { type Accessor, createContext, createSignal, type JSX, type Setter, useContext } from 'solid-js';
import { useUncontrolledState } from '../../../helpers';

type TooltipRootProps = {
  open?: boolean;
  children?: JSX.Element;
  placement?: Placement;
  fallbackPlacements?: Placement[];
};

type TooltipContextValue = {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  reference: Accessor<HTMLElement | null>;
  floating: Accessor<HTMLElement | null>;
  setReference: Setter<HTMLElement | null>;
  setFloating: Setter<HTMLElement | null>;
  floatingStyles: () => Record<any, any>;
};

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

export function TooltipRoot(props: TooltipRootProps) {
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const position = useFloating(reference, floating, {
    placement: props.placement || 'top',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({
        fallbackPlacements: props.fallbackPlacements || ['bottom'],
      }),
      shift(),
    ],
  });

  const [isOpen, setIsOpen] = useUncontrolledState({
    value: props.open,
    fallbackValue: false,
  });

  return (
    <TooltipContext.Provider
      value={{
        reference,
        setReference,
        floating,
        setFloating,
        open: isOpen,
        setOpen: setIsOpen,
        floatingStyles: () => ({
          position: position.strategy,
          top: `${position.y ?? 0}px`,
          left: `${position.x ?? 0}px`,
        }),
      }}
    >
      {props.children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within Tooltip.Root component');
  }

  return context;
}
