import { Transformer } from '../types';

interface TransformerItemProps {
  transformer: Transformer;
}

export function TransformerItem({ transformer }: TransformerItemProps) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium">{transformer.label}</span>
        </div>
        <p className="text-muted-foreground truncate text-[11px]">{transformer.description}</p>

        {transformer.example && (
          <code className="text-muted-foreground max-w-[290px] shrink-0 truncate font-mono text-[10px]">
            {transformer.example}
          </code>
        )}
      </div>
    </div>
  );
}
