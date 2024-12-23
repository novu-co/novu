import { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import isEqual from 'lodash.isequal';

import { usePreviewStep } from '@/hooks/use-preview-step';
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
      const newValue = JSON.stringify(res.previewPayloadExample, null, 2);
      if (!isEqual(editorValue, newValue)) {
        setEditorValue(newValue);
      }
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
      previewData: {
        controlValues: dataRef.current.controlValues,
        previewPayload: JSON.parse(dataRef.current.editorValue),
      },
    });
  }, [dataRef, previewStep]);

  const previewStepCallback = useCallback(() => {
    return previewStep({
      workflowSlug,
      stepSlug,
      previewData: { controlValues, previewPayload: JSON.parse(editorValue) },
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
