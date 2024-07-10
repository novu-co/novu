import { Placement } from '@floating-ui/dom';
import { Accessor, createContext, createSignal, JSX, Setter, useContext } from 'solid-js';
import { useUncontrolledState } from '../../helpers';
import { PopoverClose } from './PopoverClose';
import { PopoverContent } from './PopoverContent';
import { PopoverTrigger } from './PopoverTrigger';

export type PopoverProps = {
  open?: boolean;
  children?: JSX.Element;
  fallbackPlacements?: Placement[];
  placement?: Placement;
};

type PopoverContextType = {
  targetRef: Accessor<HTMLElement | null>;
  contentRef: Accessor<HTMLElement | null>;
  opened: Accessor<boolean>;
  setContentRef: Setter<HTMLElement | null>;
  setTargetRef: Setter<HTMLElement | null>;
  onToggle: () => void;
  onClose: () => void;
  placement?: Placement;
  fallbackPlacements?: Placement[];
};

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export function Popover(props: PopoverProps) {
  const [targetRef, setTargetRef] = createSignal<HTMLElement | null>(null);
  const [contentRef, setContentRef] = createSignal<HTMLElement | null>(null);

  const [isOpen, setIsOpen] = useUncontrolledState({
    value: props.open,
    fallbackValue: false,
  });

  const onClose = () => {
    setIsOpen(false);
  };

  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const context = {
    contentRef,
    onToggle,
    onClose,
    setContentRef,
    setTargetRef,
    targetRef,
    opened: isOpen,
    onChange: setIsOpen,
    fallbackPlacements: props.fallbackPlacements,
    placement: props.placement,
  };

  return <PopoverContext.Provider value={context}>{props.children}</PopoverContext.Provider>;
}

export function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within Popover component');
  }

  return context;
}

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Close = PopoverClose;
