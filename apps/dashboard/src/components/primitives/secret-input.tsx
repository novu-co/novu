import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputField } from './input';
import { Button } from './button';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '../../utils/constants';

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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0 hover:bg-transparent"
        onClick={() => setRevealed(!revealed)}
      >
        {revealed ? (
          <EyeOff className="text-muted-foreground/70 h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground/70 h-4 w-4" />
        )}
        <span className="sr-only">{revealed ? 'Hide' : 'Show'} password</span>
      </Button>
    </InputField>
  );
}
