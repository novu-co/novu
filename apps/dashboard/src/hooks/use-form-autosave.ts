import { useRef } from 'react';
import { DeepPartialSkipArrayKey, FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useDebounce } from './use-debounce';

export const useFormAutoSave = <T extends FieldValues>({
  debouncedSave,
  form,
  shouldFlush,
}: {
  debouncedSave: ReturnType<typeof useDebounce>;
  form: UseFormReturn<T>;
  shouldFlush?: (
    watchedData: DeepPartialSkipArrayKey<T>,
    previousWatchedData: DeepPartialSkipArrayKey<T> | null
  ) => boolean;
}) => {
  const { formState, control } = form;

  const watchedData = useWatch<T>({
    control,
  });

  const previousWatchedData = useRef<DeepPartialSkipArrayKey<T> | null>(null);

  useDeepCompareEffect(() => {
    if (!formState.isDirty) {
      previousWatchedData.current = watchedData;
      return;
    }

    const immediateSave = shouldFlush?.(watchedData, previousWatchedData.current) || false;

    if (immediateSave) {
      debouncedSave();
      debouncedSave.flush();
    } else {
      debouncedSave();
    }

    previousWatchedData.current = watchedData;
  }, [watchedData, formState.isDirty]);
};
