import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import { workflowSchema } from '../schema';

export const useStep = () => {
  const { stepSlug = '' } = useParams<{
    stepSlug: string;
  }>();

  const { watch, control } = useFormContext<z.infer<typeof workflowSchema>>();
  const steps = watch('steps');

  const step = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.find((el) => el.slug === stepSlug);
    }
    return undefined;
  }, [stepSlug, steps]);

  const stepIndex = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.findIndex((el) => el.slug === stepSlug);
    }
    return -1;
  }, [stepSlug, steps]);

  return {
    step,
    stepIndex,
    control,
    stepType: step?.type,
  };
};
