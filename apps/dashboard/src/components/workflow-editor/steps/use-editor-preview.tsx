import { useCallback, useEffect, useState } from 'react';

import { usePreviewStep } from '@/hooks';
import { NovuApiError } from '@/api/api.client';
import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';
import { useDataRef } from '@/hooks/use-data-ref';

export const useEditorPreview = ({
  workflowSlug,
  stepSlug,
  stepName,
  controlValues,
}: {
  workflowSlug: string;
  stepSlug: string;
  stepName: string;
  controlValues: Record<string, unknown>;
}) => {
  const [editorValue, setEditorValue] = useState('{}');
  const {
    previewStep,
    data: previewData,
    isPending: isPreviewPending,
  } = usePreviewStep({
    onSuccess: (res) => {
      setEditorValue(JSON.stringify(res.previewPayloadExample, null, 2));
    },
    onError: (error) => {
      if (error instanceof NovuApiError) {
        showToast({
          children: () => (
            <>
              <ToastIcon variant="error" />
              <span className="text-sm">
                Failed to preview step <span className="font-bold">{stepName}</span> with error: {error.message}
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
    },
  });
  const dataRef = useDataRef({
    workflowSlug,
    stepSlug,
    controlValues,
    editorValue,
  });

  useEffect(() => {
    previewStep({
      workflowSlug: dataRef.current.workflowSlug,
      stepSlug: dataRef.current.stepSlug,
      data: { controlValues: dataRef.current.controlValues, previewPayload: JSON.parse(dataRef.current.editorValue) },
    });
  }, [dataRef, previewStep]);

  const previewStepCallback = useCallback(() => {
    return previewStep({
      workflowSlug,
      stepSlug,
      data: { controlValues, previewPayload: JSON.parse(editorValue) },
    });
  }, [workflowSlug, stepSlug, controlValues, editorValue, previewStep]);

  return {
    editorValue,
    setEditorValue,
    previewStep: previewStepCallback,
    previewData,
    isPreviewPending,
  };
};
