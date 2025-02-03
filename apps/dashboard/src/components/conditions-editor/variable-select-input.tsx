import { InputPure } from '@/components/primitives/input';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '@/utils/constants';
import { forwardRef } from 'react';

export interface VariableSelectInputProps {
  inputValue: string;
  onOpen: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusCapture: () => void;
  onBlurCapture?: () => void;
  placeholder?: string;
  disabled?: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  leftIcon?: React.ReactNode;
}

export const VariableSelectInput = forwardRef<HTMLInputElement, VariableSelectInputProps>(
  ({ onOpen, onInputChange, onFocusCapture, onBlurCapture, placeholder, disabled, onKeyDown, leftIcon }, ref) => {
    return (
      <div className="flex w-full items-center gap-1">
        {leftIcon}
        <InputPure
          ref={ref}
          onClick={onOpen}
          onChange={onInputChange}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={onKeyDown}
          {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
        />
      </div>
    );
  }
);

VariableSelectInput.displayName = 'VariableSelectInput';
