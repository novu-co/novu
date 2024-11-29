// useFormAutosave.ts
import { useEffect } from 'react';
import { UseFormReturn, useWatch, FieldValues } from 'react-hook-form';
import { useDataRef } from './use-data-ref';
import { useDebounce } from './use-debounce';

const TEN_SECONDS = 10 * 1000;

export function useFormAutosave<U extends Record<string, unknown>, T extends FieldValues = FieldValues>({
  previousData,
  form: propsForm,
  isReadOnly,
  update,
}: {
  previousData: U;
  form: UseFormReturn<T>;
  isReadOnly?: boolean;
  update: (data: U) => void;
}) {
  const formRef = useDataRef(propsForm);
  const watchedData = useWatch<T>({
    control: propsForm.control,
  });

  const onUpdate = async (data: T) => {
    // use the form reference instead of descructuring the props to avoid stale closures
    const form = formRef.current;
    const isDirty = form.formState.isDirty;
    if (!isDirty || isReadOnly) {
      return;
    }
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const values = { ...previousData, ...data };
    // reset the dirty fields right away because on slow networks the patch request might take a while
    // so other blur/change events might trigger in the meantime
    form.reset(values);
    update(values);
  };

  const onFlushInternal = async () => {
    // use the form reference instead of descructuring the props to avoid stale closures
    const form = formRef.current;
    const values = form.getValues();
    onUpdate({ ...values });
  };

  const debouncedOnUpdate = useDebounce(onUpdate, TEN_SECONDS);

  const onBlur = (e: React.FocusEvent<HTMLFormElement, Element>) => {
    e.preventDefault();
    e.stopPropagation();
    propsForm.handleSubmit(onUpdate)(e);
  };

  // flush the form updates right away
  const flushFormUpdates = (): Promise<void> => {
    return new Promise((resolve) => {
      // await for the state to be updated
      setTimeout(async () => {
        await onFlushInternal();

        resolve();
      }, 0);
    });
  };

  // handles form changes
  useEffect(() => {
    const values = formRef.current.getValues();
    debouncedOnUpdate(values);
  }, [watchedData, debouncedOnUpdate, formRef]);

  return {
    onBlur,
    flushFormUpdates,
  };
}
