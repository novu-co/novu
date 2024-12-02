import { CSSProperties, useEffect, useRef, useState } from 'react';
import { InAppRenderOutput, StepDataDto, WorkflowResponseDto } from '@novu/shared';

import { Notification5Fill } from '@/components/icons';
import { Code2 } from '@/components/icons/code-2';
import { Button } from '@/components/primitives/button';
import { Editor } from '@/components/primitives/editor';
import {
  InAppPreview,
  InAppPreviewActions,
  InAppPreviewAvatar,
  InAppPreviewBell,
  InAppPreviewBody,
  InAppPreviewHeader,
  InAppPreviewNotification,
  InAppPreviewNotificationContent,
  InAppPreviewPrimaryAction,
  InAppPreviewSecondaryAction,
  InAppPreviewSubject,
} from '@/components/workflow-editor/in-app-preview';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion';
import { InAppTabsSection } from '@/components/workflow-editor/steps/in-app/in-app-tabs-section';
import { useEditorPreview } from '../use-editor-preview';

const getInitialAccordionValue = (value: string) => {
  try {
    return Object.keys(JSON.parse(value)).length > 0 ? 'payload' : undefined;
  } catch (e) {
    return undefined;
  }
};

type InAppEditorPreviewProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  formValues: Record<string, unknown>;
};

export const InAppEditorPreview = ({ workflow, step, formValues }: InAppEditorPreviewProps) => {
  const workflowSlug = workflow.workflowId;
  const stepSlug = step.stepId;
  const { editorValue, setEditorValue, previewStep, previewData, isPreviewPending } = useEditorPreview({
    workflowSlug,
    stepSlug,
    stepName: step.name,
    controlValues: formValues,
  });
  const [accordionValue, setAccordionValue] = useState<string | undefined>(getInitialAccordionValue(editorValue));
  const [payloadError, setPayloadError] = useState('');
  const [height, setHeight] = useState(0);
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

  const previewResult = previewData?.result;
  const preview = previewResult?.preview as InAppRenderOutput | undefined;

  return (
    <InAppTabsSection>
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Notification5Fill className="size-3" />
          In-app template editor
        </div>

        <div className="relative my-2">
          <div className="relative mx-auto max-w-sm">
            <InAppPreviewBell />

            <InAppPreview className="min-h-64">
              <InAppPreviewHeader />

              <InAppPreviewNotification>
                <InAppPreviewAvatar src={preview?.avatar} isPending={isPreviewPending} />

                <InAppPreviewNotificationContent>
                  <InAppPreviewSubject isPending={isPreviewPending}>{preview?.subject}</InAppPreviewSubject>
                  <InAppPreviewBody isPending={isPreviewPending} className="line-clamp-6">
                    {preview?.body}
                  </InAppPreviewBody>

                  <InAppPreviewActions>
                    <InAppPreviewPrimaryAction isPending={isPreviewPending}>
                      {preview?.primaryAction?.label}
                    </InAppPreviewPrimaryAction>

                    <InAppPreviewSecondaryAction isPending={isPreviewPending}>
                      {preview?.secondaryAction?.label}
                    </InAppPreviewSecondaryAction>
                  </InAppPreviewActions>
                </InAppPreviewNotificationContent>
              </InAppPreviewNotification>
            </InAppPreview>
          </div>
          <div className="to-background absolute -bottom-3 h-16 w-full bg-gradient-to-b from-transparent to-80%" />
        </div>

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
      </div>
    </InAppTabsSection>
  );
};
