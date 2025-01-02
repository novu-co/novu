export type Transformer = {
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

export type TransformerWithParam = {
  value: string;
  params?: string[];
};

export type VariablePopoverProps = {
  variable?: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
};
