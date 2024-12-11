import { Input } from '@/components/primitives/input';
import { RiSearchLine } from 'react-icons/ri';

interface IntegrationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function IntegrationSearch({ value, onChange }: IntegrationSearchProps) {
  return (
    <div className="border-border bg-background sticky top-0 z-10 border-b p-3">
      <div className="relative">
        <RiSearchLine className="text-foreground-300 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search integrations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
