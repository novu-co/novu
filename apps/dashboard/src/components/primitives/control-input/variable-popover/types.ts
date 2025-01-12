export type Filters = {
  label: string;
  value: string;
  hasParam?: boolean;
  description?: string;
  example?: string;
  params?: {
    placeholder: string;
    description?: string;
    type?: 'string' | 'number';
  }[];
};

export type FilterWithParam = {
  value: string;
  params?: string[];
};

export type VariablePopoverProps = {
  variable?: string;
  onUpdate: (newValue: string) => void;
};
