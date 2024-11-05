import { FieldValues, SubmitHandler, UseFormReturn, useWatch } from 'react-hook-form';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useDebounce } from './use-debounce';
import { useDataRef } from './use-data-ref';
import { useCallback, useRef } from 'react';

export const useFormAutoSave = <T extends FieldValues>({
  onSubmit,
  form,
  enabled = true,
}: {
  onSubmit: SubmitHandler<T>;
  form: UseFormReturn<T>;
  enabled?: boolean;
}) => {
  const onSubmitRef = useDataRef(onSubmit);
  const { formState, control, handleSubmit } = form;
  const previousStepsLength = useRef<number | null>(null);

  const watchedData = useWatch<T>({
    control,
  });

  const save = () => {
    if (enabled) {
      handleSubmit(onSubmitRef.current)();
    }
  };

  const debouncedSave = useDebounce(save, 500);

  const checkStepsDeleted = useCallback(() => {
    const currentStepsLength = watchedData.steps?.length ?? 0;
    const wasDeleted = previousStepsLength.current !== null && currentStepsLength < previousStepsLength.current;

    previousStepsLength.current = currentStepsLength;

    return wasDeleted;
  }, [watchedData]);

  useDeepCompareEffect(() => {
    if (!formState.isDirty) {
      // set the previous steps length to the current steps length upon mount
      previousStepsLength.current = watchedData.steps?.length ?? 0;

      return;
    }

    const wasDeleted = checkStepsDeleted();

    if (wasDeleted) {
      save();
    } else {
      debouncedSave();
    }
  }, [watchedData]);
};
