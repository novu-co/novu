export interface Transformer {
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
}

export interface TransformerWithParam {
  value: string;
  params?: string[];
}

export interface VariablePopoverProps {
  variable: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
}
