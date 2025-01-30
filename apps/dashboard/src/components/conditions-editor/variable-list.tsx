import { forwardRef } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { Code2 } from '@/components/icons/code-2';
import { cn } from '@/utils/ui';

const KeyboardItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <span
      className={cn(
        'text-foreground-400 shadow-xs text-paragraph-2xs flex h-5 w-5 items-center justify-center rounded-[6px] border border-neutral-200 px-2 py-1 font-light',
        className
      )}
    >
      {children}
    </span>
  );
};

interface VariablesListProps {
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  selectedValue?: string;
  title: string;
  hoveredOptionIndex: number;
}

export const VariablesList = forwardRef<HTMLUListElement, VariablesListProps>(
  ({ options, onSelect, selectedValue, title, hoveredOptionIndex }, ref) => {
    return (
      <div className="flex flex-col">
        <header className="flex items-center justify-between gap-1 border-b border-neutral-100 bg-neutral-50 p-1">
          <span className="text-foreground-400 text-paragraph-2xs uppercase">{title}</span>
          <KeyboardItem>{`{`}</KeyboardItem>
        </header>
        <ul ref={ref} className="relative flex max-h-[200px] flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-1">
          {options.map((option, index) => (
            <li
              className={cn(
                'text-paragraph-xs font-code text-foreground-950 flex cursor-pointer items-center gap-1 rounded-sm p-1 hover:bg-neutral-100',
                hoveredOptionIndex === index ? 'bg-neutral-100' : ''
              )}
              key={option.value}
              value={option.value}
              onClick={() => {
                console.log('onClick onSelect option.value', option.value);
                onSelect(option.value ?? '');
              }}
            >
              <Code2 className="text-feature size-3 min-w-3" />
              {option.label}
              <CheckIcon
                className={cn('ml-auto size-4', selectedValue === option.value ? 'opacity-50' : 'opacity-0')}
              />
            </li>
          ))}
        </ul>
        <footer className="flex items-center gap-1 border-t border-neutral-100 p-1">
          <div className="flex w-full items-center gap-0.5">
            <KeyboardItem>↑</KeyboardItem>
            <KeyboardItem>↓</KeyboardItem>
            <span className="text-foreground-600 text-paragraph-xs ml-0.5">Navigate</span>
            <KeyboardItem className="ml-auto">↵</KeyboardItem>
          </div>
        </footer>
      </div>
    );
  }
);

VariablesList.displayName = 'VariablesList';
