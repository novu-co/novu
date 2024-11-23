import { CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { Collapsible } from '@radix-ui/react-collapsible';
import { ArrayFieldTemplateProps, getTemplate, getUiOptions } from '@rjsf/utils';
import { useState } from 'react';
import { RiExpandUpDownLine } from 'react-icons/ri';

export function ObjectFieldTemplate(props: ArrayFieldTemplateProps) {
  const { canAdd, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, title, schema } =
    props;
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;
  const uiOptions = getUiOptions(uiSchema);

  const ArrayFieldTitleTemplate = getTemplate('ArrayFieldTitleTemplate', registry, uiOptions);

  const ArrayFieldItemTemplate = getTemplate('ArrayFieldItemTemplate', registry, uiOptions);

  const [isEditorOpen, setIsEditorOpen] = useState(true);

  return (
    <Collapsible
      open={isEditorOpen}
      onOpenChange={setIsEditorOpen}
      className="bg-background border-neutral-alpha-200 relative flex w-full flex-col gap-2 rounded-lg border px-3 py-4"
    >
      <div className="absolute left-0 top-0 z-10 flex w-full -translate-y-1/2 items-center justify-between p-0 px-2 text-sm">
        <div className="flex w-full items-center gap-1">
          <span className="bg-background px-1">
            <ArrayFieldTitleTemplate
              idSchema={idSchema}
              title={uiOptions.title || title}
              schema={schema}
              uiSchema={uiSchema}
              required={required}
              registry={registry}
            />
          </span>
          <div className="bg-background text-foreground-600 ml-auto mr-3 flex items-center gap-1">
            <AddButton onClick={onAddClick} disabled={disabled || readonly} registry={registry} />
            <CollapsibleTrigger>
              <RiExpandUpDownLine className="text-foreground-600 size-3" />
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <CollapsibleContent>
        {items.map(({ key, ...itemProps }) => {
          return <ArrayFieldItemTemplate key={key} {...itemProps} />;
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
