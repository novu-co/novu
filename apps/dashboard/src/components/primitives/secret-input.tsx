import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SecretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  register?: any;
  registerKey?: string;
  registerOptions?: any;
}

export function SecretInput({ className, register, registerKey, registerOptions, ...props }: SecretInputProps) {
  const [revealed, setRevealed] = useState(false);

  const inputProps = register && registerKey ? register(registerKey, registerOptions) : props;

  return (
    <div className="relative">
      <Input
        type={revealed ? 'text' : 'password'}
        className={cn(
          'pr-10',
          'border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring',
          'h-9 rounded-md border px-3 py-1 text-sm transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...inputProps}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-9 w-9 px-0 hover:bg-transparent"
        onClick={() => setRevealed(!revealed)}
      >
        {revealed ? (
          <EyeOff className="text-muted-foreground/70 h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground/70 h-4 w-4" />
        )}
        <span className="sr-only">{revealed ? 'Hide' : 'Show'} password</span>
      </Button>
    </div>
  );
}
