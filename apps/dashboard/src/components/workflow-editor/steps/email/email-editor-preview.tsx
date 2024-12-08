import { ChannelTypeEnum, type StepDataDto, type WorkflowResponseDto } from '@novu/shared';
import { CSSProperties, useEffect, useRef, useState } from 'react';

import { Code2 } from '@/components/icons/code-2';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion';
import { Button } from '@/components/primitives/button';
import { Editor } from '@/components/primitives/editor';
import { Skeleton } from '@/components/primitives/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import {
  EmailPreviewBody,
  EmailPreviewBodyMobile,
  EmailPreviewContentMobile,
  EmailPreviewHeader,
  EmailPreviewSubject,
  EmailPreviewSubjectMobile,
} from '@/components/workflow-editor/steps/email/email-preview';
import { EmailTabsPreviewSection } from '@/components/workflow-editor/steps/email/email-tabs-section';
import { TabsContent } from '@radix-ui/react-tabs';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { RiMacLine, RiSmartphoneFill } from 'react-icons/ri';
import { useEditorPreview } from '../use-editor-preview';
import { Separator } from '@/components/primitives/separator';

const getInitialAccordionValue = (value: string) => {
  try {
    return Object.keys(JSON.parse(value)).length > 0 ? 'payload' : undefined;
  } catch (e) {
    return undefined;
  }
};

type EmailEditorPreviewProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  formValues: Record<string, unknown>;
};

export const EmailEditorPreview = ({ workflow, step, formValues }: EmailEditorPreviewProps) => {
  const workflowSlug = workflow.workflowId;
  const stepSlug = step.stepId;
  const { editorValue, setEditorValue, isPreviewPending, previewData, previewStep } = useEditorPreview({
    workflowSlug,
    stepSlug,
    controlValues: formValues,
  });
  const [accordionValue, setAccordionValue] = useState<string | undefined>(getInitialAccordionValue(editorValue));
  const [payloadError, setPayloadError] = useState('');
  const [height, setHeight] = useState(0);
  const [activeTab, setActiveTab] = useState('desktop');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccordionValue(getInitialAccordionValue(editorValue));
  }, [editorValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [editorValue]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex w-full items-center justify-between p-3">
        <EmailPreviewHeader />
        <TabsList>
          <TabsTrigger value="mobile">
            <RiSmartphoneFill className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="desktop">
            <RiMacLine className="size-4" />
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="relative flex flex-col gap-3">
        {isPreviewPending ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <>
            {previewData?.result?.type == ChannelTypeEnum.EMAIL ? (
              <>
                <TabsContent value="mobile">
                  <div className="w-full bg-neutral-100">
                    <EmailPreviewContentMobile className="mx-auto">
                      <EmailPreviewSubjectMobile subject={previewData.result.preview.subject} />
                      <EmailPreviewBodyMobile body={previewData.result.preview.body} />
                    </EmailPreviewContentMobile>
                  </div>
                </TabsContent>
                <TabsContent value="desktop">
                  <EmailPreviewSubject subject={previewData.result.preview.subject} />
                  <Separator className="bg-neutral-200" />
                  <EmailPreviewBody body={previewData.result.preview.body} />
                </TabsContent>
              </>
            ) : (
              <div className="p-6">No preview available</div>
            )}
          </>
        )}
        <EmailTabsPreviewSection>
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
                  value={editorValue}
                  onChange={setEditorValue}
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
                      previewStep();
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
        </EmailTabsPreviewSection>
      </div>
    </Tabs>
  );
};
