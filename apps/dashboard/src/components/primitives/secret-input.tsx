import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '../../utils/constants';
import { CompactButton } from './button-compact';
import { Input, InputField } from './input';

interface SecretInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function SecretInput({ className, value, onChange, ...props }: SecretInputProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <InputField className="flex overflow-hidden pr-0">
      <Input
        type={revealed ? 'text' : 'password'}
        {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      <CompactButton
        type="button"
        variant="ghost"
        icon={revealed ? RiEyeOffLine : RiEyeLine}
        className="text-foreground-400 h-9 w-9 px-0 hover:bg-transparent"
        onClick={() => setRevealed(!revealed)}
      >
        <span className="sr-only">{revealed ? 'Hide' : 'Show'} password</span>
      </CompactButton>
    </InputField>
  );
}
