import { Transformer } from '../types';

interface TransformerItemProps {
  transformer: Transformer;
}

export function TransformerItem({ transformer }: TransformerItemProps) {
  return (
    <div className="flex w-full flex-col py-1">
      <div className="flex items-center gap-1">
        <span className="font-medium">{transformer.label}</span>
      </div>
      <code className="text-text-sub text-[10px]">{transformer.description}</code>

      {transformer.example && (
        <div className="bg-bg-weak rounded-6 mt-1 w-full max-w-[270px] p-1">
          <code className="text-text-sub font-mono text-[10px]">{transformer.example}</code>
        </div>
      )}
    </div>
  );
}
