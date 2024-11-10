import { useState } from 'react';
import { RJSFSchema } from '@rjsf/utils';
import { RiArrowDownSLine, RiArrowUpSLine, RiInputField } from 'react-icons/ri';
import { type ControlsMetadata } from '@novu/shared';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { JsonForm } from './json-form';

export function CustomStepControls({ dataSchema }: { dataSchema: ControlsMetadata['dataSchema'] }) {
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  if (!dataSchema) {
    return null;
  }

  return (
    <Collapsible
      open={isEditorOpen}
      onOpenChange={setIsEditorOpen}
      className="bg-neutral-alpha-50 border-neutral-alpha-200 flex w-full flex-col gap-2 rounded-lg border p-2"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <RiInputField className="text-feature size-5" />
          <span className="text-sm font-medium">Custom steps controls</span>
        </div>

        {isEditorOpen ? (
          <RiArrowUpSLine className="text-neutral-alpha-400 size-5" />
        ) : (
          <RiArrowDownSLine className="text-neutral-alpha-400 size-5" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-background rounded-md border border-dashed px-3 py-0">
          <JsonForm schema={(dataSchema as RJSFSchema) || {}} variables={[]} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
