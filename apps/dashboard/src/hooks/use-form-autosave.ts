import { DeepPartialSkipArrayKey, FieldValues, SubmitHandler, UseFormReturn, useWatch } from 'react-hook-form';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useDebounce } from './use-debounce';
import { useDataRef } from './use-data-ref';
import { useRef } from 'react';

export const useFormAutoSave = <T extends FieldValues>({
  onSubmit,
  form,
  enabled = true,
  shouldSaveImmediately,
}: {
  onSubmit: SubmitHandler<T>;
  form: UseFormReturn<T>;
  enabled?: boolean;
  shouldSaveImmediately?: (
    watchedData: DeepPartialSkipArrayKey<T>,
    previousWatchedData: DeepPartialSkipArrayKey<T> | null
  ) => boolean;
}) => {
  const onSubmitRef = useDataRef(onSubmit);
  const saveRef = useDataRef(() => {
    if (enabled) {
      handleSubmit(onSubmitRef.current)();
    }
  });
  const { formState, control, handleSubmit } = form;

  const watchedData = useWatch<T>({
    control,
  });

  const debouncedSave = useDebounce(saveRef.current, 800);

  const previousWatchedData = useRef<DeepPartialSkipArrayKey<T> | null>(null);

  useDeepCompareEffect(() => {
    if (!formState.isDirty) {
      previousWatchedData.current = watchedData;
      return;
    }

    const immediateSave = shouldSaveImmediately?.(watchedData, previousWatchedData.current) || false;

    if (immediateSave) {
      saveRef.current();
    } else {
      debouncedSave();
    }

    previousWatchedData.current = watchedData;
  }, [watchedData]);
};
