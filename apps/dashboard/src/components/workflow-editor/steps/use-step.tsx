import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import { formSchema } from '../schema';

export const useStep = () => {
  const { stepUuid = '' } = useParams<{
    stepUuid: string;
  }>();

  const { watch } = useFormContext<z.infer<typeof formSchema>>();
  const steps = watch('steps');

  const step = useMemo(() => steps.find((message) => message.uuid === stepUuid), [stepUuid, steps]);

  const stepIndex = useMemo(() => steps.findIndex((message) => message.uuid === stepUuid), [stepUuid, steps]);

  return {
    step,
    stepIndex,
    channel: step?.type,
  };
};
