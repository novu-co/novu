// useFormAutosave.ts
import { useCallback, useEffect } from 'react';
import { UseFormReturn, useWatch, FieldValues } from 'react-hook-form';
import { useDataRef } from '@/hooks/use-data-ref';
import { useDebounce } from '@/hooks/use-debounce';

const TEN_SECONDS = 10 * 1000;

export function useFormAutosave<U extends Record<string, unknown>, T extends FieldValues = FieldValues>({
  previousData,
  form: propsForm,
  isReadOnly,
  save,
}: {
  previousData: U;
  form: UseFormReturn<T>;
  isReadOnly?: boolean;
  save: (data: U) => void;
}) {
  const formRef = useDataRef(propsForm);
  const watchedData = useWatch<T>({
    control: propsForm.control,
  });

  const onSave = useCallback(
    async (data: T) => {
      // use the form reference instead of destructuring the props to avoid stale closures
      const form = formRef.current;
      const dirtyFields = form.formState.dirtyFields;
      // somehow the form isDirty flag is lost on first blur that why we fallback to dirtyFields
      const isDirty = form.formState.isDirty || Object.keys(dirtyFields).length > 0;
      if (!isDirty || isReadOnly) {
        return;
      }
      // manually trigger the validation of the form
      const isValid = await form.trigger();
      if (!isValid) {
        return;
      }

      const values = { ...previousData, ...data };
      // reset the dirty fields right away because on slow networks the patch request might take a while
      // so other blur/change events might trigger in the meantime
      form.reset(values);
      save(values);
    },
    [formRef, previousData, isReadOnly, save]
  );

  const debouncedOnSave = useDebounce(onSave, TEN_SECONDS);

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLFormElement, Element>) => {
      e.preventDefault();
      e.stopPropagation();

      const form = formRef.current;
      const values = form.getValues();

      // cancel the pending debounces for example on change events
      debouncedOnSave.cancel();
      onSave(values);
    },
    [formRef, onSave, debouncedOnSave]
  );

  // flush the form updates right away
  const saveForm = (): Promise<void> => {
    return new Promise((resolve) => {
      // await for the state to be updated
      setTimeout(async () => {
        // use the form reference instead of destructuring the props to avoid stale closures
        const form = formRef.current;
        const values = form.getValues();
        await onSave(values);

        resolve();
      }, 0);
    });
  };

  // handles form changes
  useEffect(() => {
    const values = formRef.current.getValues();
    debouncedOnSave(values);
  }, [watchedData, debouncedOnSave, formRef]);

  return {
    onBlur,
    saveForm,
  };
}
