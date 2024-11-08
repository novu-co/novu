import { useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

import { Notification5Fill } from '@/components/icons';
import { Code2 } from '@/components/icons/code-2';
import { Button } from '@/components/primitives/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { Editor } from '@/components/primitives/editor';
import { usePreviewStep } from '@/hooks/use-preview-step';
import { useParams } from 'react-router-dom';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';

export const InAppEditorPreview = () => {
  const [editorValue, setEditorValue] = useState('{}');
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const { previewStep, data } = usePreviewStep();
  const { workflowSlug = '', stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
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
            value={editorValue}
            onChange={setEditorValue}
            lang="json"
            basicSetup={{ lineNumbers: true, defaultKeymap: true }}
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
                previewStep({ workflowSlug, stepSlug, payload: JSON.parse(editorValue) });
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
