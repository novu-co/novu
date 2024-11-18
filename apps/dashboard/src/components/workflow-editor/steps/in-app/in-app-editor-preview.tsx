import { CSSProperties, useEffect, useRef, useState } from 'react';
import { GeneratePreviewResponseDto } from '@novu/shared';

import { Notification5Fill } from '@/components/icons';
import { Code2 } from '@/components/icons/code-2';
import { Button } from '@/components/primitives/button';
import { Editor } from '@/components/primitives/editor';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion';

type InAppEditorPreviewProps = {
  value: string;
  onChange: (value: string) => void;
  previewData?: GeneratePreviewResponseDto;
  applyPreview: () => void;
  isPreviewLoading?: boolean;
};
export const InAppEditorPreview = (props: InAppEditorPreviewProps) => {
  const { value, onChange, previewData, applyPreview, isPreviewLoading } = props;
  const [accordionValue, setAccordionValue] = useState('payload');
  const [payloadError, setPayloadError] = useState('');
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    }, 0);
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <Notification5Fill className="size-3" />
        In-app template editor
      </div>

      <InAppPreview data={previewData} isLoading={isPreviewLoading} />

      <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
        <AccordionItem value="payload">
          <AccordionTrigger>
            <div className="flex items-center gap-1">
              <Code2 className="size-5" />
              Configure preview
            </div>
          </AccordionTrigger>
          <AccordionContent
            ref={contentRef}
            className="flex flex-col gap-2"
            style={{ '--radix-collapsible-content-height': `${height}px` } as CSSProperties}
          >
            <Editor
              value={value}
              onChange={onChange}
              lang="json"
              extensions={[loadLanguage('json')?.extension ?? []]}
              className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 rounded-lg border border-dashed p-3"
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
                  setPayloadError('');
                } catch (e) {
                  setPayloadError(String(e));
                }
              }}
            >
              Apply
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
