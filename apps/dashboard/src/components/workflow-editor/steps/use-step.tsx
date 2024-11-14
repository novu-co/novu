import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import { workflowSchema } from '../schema';
import { getStepBase62Id } from '@/utils/step';

export const useStep = () => {
  const { stepSlug = '' } = useParams<{
    stepSlug: string;
  }>();

  const { control } = useFormContext<z.infer<typeof workflowSchema>>();
  const steps = useWatch({ name: 'steps', control });
  const base62Id = getStepBase62Id(stepSlug);

  const step = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.find((el) => getStepBase62Id(el.slug) === base62Id);
    }
    return undefined;
  }, [base62Id, steps]);

  const stepIndex = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.findIndex((el) => getStepBase62Id(el.slug) === base62Id);
    }
    return -1;
  }, [base62Id, steps]);

  return {
    step,
    stepIndex,
    control,
    stepType: step?.type,
  };
};
