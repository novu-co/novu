import { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';

import { usePreviewStep } from '@/hooks';
import { useDataRef } from '@/hooks/use-data-ref';

export const useEditorPreview = ({
  workflowSlug,
  stepSlug,
  controlValues,
}: {
  workflowSlug: string;
  stepSlug: string;
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
      Sentry.captureException(error);
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
