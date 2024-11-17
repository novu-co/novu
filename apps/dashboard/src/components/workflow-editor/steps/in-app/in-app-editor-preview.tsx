import { useState } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

import { Notification5Fill } from '@/components/icons';
import { Code2 } from '@/components/icons/code-2';
import { Button } from '@/components/primitives/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { Editor } from '@/components/primitives/editor';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';
import { GeneratePreviewResponseDto } from '@novu/shared';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';

type InAppEditorPreviewProps = {
  value: string;
  onChange: (value: string) => void;
  previewData?: GeneratePreviewResponseDto;
  applyPreview: () => void;
};
export const InAppEditorPreview = (props: InAppEditorPreviewProps) => {
  const { value, onChange, previewData, applyPreview } = props;
  const [isEditorOpen, setIsEditorOpen] = useState(true);
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
                applyPreview();
              } catch (e) {
                setPayloadError(String(e));
              }
            }}
          >
            Apply
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {previewData && <InAppPreview data={previewData} />}
    </div>
  );
};
