import { useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

import { Notification5Fill } from '@/components/icons';
import { Code2 } from '@/components/icons/code-2';
import { Button } from '@/components/primitives/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { Editor } from '@/components/primitives/editor';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';
import { usePreviewStep } from '@/hooks/use-preview-step';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

type InAppEditorPreviewProps = {
  value: string;
  onChange: (value: string) => void;
};
export const InAppEditorPreview = (props: InAppEditorPreviewProps) => {
  const { value, onChange } = props;
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const { previewStep, data } = usePreviewStep();
  const { workflowSlug = '', stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const form = useFormContext();
  const [payloadError, setPayloadError] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Notification5Fill className="size-3" />
        In-app template
      </div>

      <Collapsible
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        className="bg-neutral-alpha-50 border-neutral-alpha-200 flex w-full flex-col gap-2 rounded-lg border p-2"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Code2 className="size-5" />
            Configure preview
          </div>

          {isEditorOpen ? (
            <RiArrowUpSLine className="text-neutral-alpha-400 size-5" />
          ) : (
            <RiArrowDownSLine className="text-neutral-alpha-400 size-5" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col gap-2 rounded-lg p-1">
          <Editor
            value={value}
            onChange={onChange}
            lang="json"
            extensions={[loadLanguage('json')?.extension ?? []]}
            className="border-neutral-alpha-200 bg-background text-foreground-600 rounded-lg border border-dashed p-3"
          />
          {payloadError && <p className="text-destructive text-xs">{payloadError}</p>}
          <Button
            size="xs"
            type="button"
            variant="outline"
            className="self-end"
            onClick={() => {
              try {
                previewStep({
                  workflowSlug,
                  stepSlug,
                  data: { controlValues: form.getValues(), previewPayload: JSON.parse(value) },
                });
              } catch (e) {
                setPayloadError(String(e));
              }
            }}
          >
            Apply
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {data && <InAppPreview data={data} />}
    </div>
  );
};
