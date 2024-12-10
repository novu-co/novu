import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  register?: any;
  registerKey?: string;
  registerOptions?: any;
}

export function SecretInput({ className, register, registerKey, registerOptions, ...props }: SecretInputProps) {
  const [revealed, setRevealed] = useState(false);

  const inputProps = register && registerKey ? register(registerKey, registerOptions) : props;

  return (
    <>
      <Input type={revealed ? 'text' : 'password'} {...inputProps} />
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
    </>
  );
}
