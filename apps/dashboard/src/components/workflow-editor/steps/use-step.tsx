import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import { workflowSchema } from '../schema';
import { getBase62Id, STEP_DIVIDER } from '@/utils/step';

export const useStep = () => {
  const { stepSlug = '' } = useParams<{
    stepSlug: string;
  }>();

  const { control } = useFormContext<z.infer<typeof workflowSchema>>();
  const steps = useWatch({ name: 'steps', control });
  const base62Id = getBase62Id({ slug: stepSlug, divider: STEP_DIVIDER });

  const step = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.find((el) => getBase62Id({ slug: el.slug, divider: STEP_DIVIDER }) === base62Id);
    }
    return undefined;
  }, [base62Id, steps]);

  const stepIndex = useMemo(() => {
    if (Array.isArray(steps)) {
      return steps.findIndex((el) => getBase62Id({ slug: el.slug, divider: STEP_DIVIDER }) === base62Id);
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
