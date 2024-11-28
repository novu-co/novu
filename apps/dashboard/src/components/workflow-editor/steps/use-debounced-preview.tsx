import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { StepDataDto, WorkflowResponseDto } from '@novu/shared';

import { usePreviewStep } from '@/hooks';
import { NovuApiError } from '@/api/api.client';
import useDebouncedEffect from '@/hooks/use-debounced-effect';
import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';

export const useDebouncedPreview = ({ workflow, step }: { workflow: WorkflowResponseDto; step: StepDataDto }) => {
  const [editorValue, setEditorValue] = useState('{}');
  const { previewStep, data: previewData, isPending: isPreviewPending } = usePreviewStep();

  const preview = async (props: {
    controlValues: Record<string, unknown>;
    previewPayload: Record<string, unknown>;
  }) => {
    try {
      const res = await previewStep({
        workflowSlug: workflow.workflowId,
        stepSlug: step.stepId,
        data: { controlValues: props.controlValues, previewPayload: props.previewPayload },
      });
      setEditorValue(JSON.stringify(res.previewPayloadExample, null, 2));
    } catch (err) {
      if (err instanceof NovuApiError) {
        showToast({
          children: () => (
            <>
              <ToastIcon variant="error" />
              <span className="text-sm">
                Failed to preview step <span className="font-bold">{step.name}</span> with error: {err.message}
              </span>
            </>
          ),
          options: {
            position: 'bottom-right',
            classNames: {
              toast: 'ml-10 mb-4',
            },
          },
        });
      }
    }
  };

  const form = useFormContext();
  const formValues = useWatch(form);
  useDebouncedEffect(
    () => {
      preview({
        controlValues: form.getValues() as Record<string, unknown>,
        /**
         * Reset the preview payload to an empty object on form change
         * to prevent showing the previous payload
         */
        previewPayload: {},
      });
    },
    2000,
    [formValues]
  );

  return { editorValue, setEditorValue, previewStep, previewData, isPreviewPending };
};
