import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import { workflowSchema } from '../schema';

export const useStep = () => {
  const { stepId = '' } = useParams<{
    stepId: string;
  }>();

  const { watch, control } = useFormContext<z.infer<typeof workflowSchema>>();
  const steps = watch('steps');

  const step = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.find((message) => message._id === stepId);
    }
    return undefined;
  }, [stepId, steps]);

  const stepIndex = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.findIndex((message) => message._id === stepId);
    }
    return -1;
  }, [stepId, steps]);

  return {
    step,
    stepIndex,
    control,
    stepType: step?.type,
  };
};
