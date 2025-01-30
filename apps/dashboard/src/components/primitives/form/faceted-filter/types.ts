import { ComponentType } from 'react';

export type ValueType = 'single' | 'multi' | 'text';
export type SizeType = 'default' | 'small';

export interface FilterOption {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface FacetedFilterProps {
  title?: string;
  type?: ValueType;
  size?: SizeType;
  options?: FilterOption[];
  selected?: string[];
  onSelect?: (values: string[]) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ComponentType<{ className?: string }>;
  hideTitle?: boolean;
  hideSearch?: boolean;
  hideClear?: boolean;
}
