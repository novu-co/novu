// useFormAutosave.ts
import { useEffect } from 'react';
import { UseFormReturn, useWatch, FieldValues } from 'react-hook-form';

export function useFormAutosave<T extends FieldValues>(form: UseFormReturn<T>, save: (data: T) => void): void {
  const watchedData = useWatch<T>({
    control: form.control,
  });

  useEffect(() => {
    const handleSave = async () => {
      if (!form.formState.isDirty) {
        return;
      }
      const isValid = await form.trigger();
      if (isValid) {
        const values = form.getValues();
        save(values);
      }
    };

    handleSave();
  }, [watchedData]);
}
