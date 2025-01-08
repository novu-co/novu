import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Switch } from '@/components/primitives/switch';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';
import { useFormContext } from 'react-hook-form';

const fieldKey = 'disableOutputSanitization';

export const InAppDisableSanitizationSwitch = () => {
  const { control } = useFormContext();
  const { saveForm } = useSaveForm();

  return (
    <div className="flex flex-col gap-1">
      <FormLabel>Disable Output Sanitization</FormLabel>
      <FormField
        control={control}
        name={fieldKey}
        render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-2">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(e) => {
                  field.onChange(e);
                  saveForm();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
