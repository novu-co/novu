import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { HelpTooltipIndicator } from '@/components/primitives/help-tooltip-indicator';
import { Switch } from '@/components/primitives/switch';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';
import { useFormContext } from 'react-hook-form';

const fieldKey = 'disableOutputSanitization';

export const InAppDisableSanitizationSwitch = () => {
  const { control } = useFormContext();
  const { saveForm } = useSaveForm();

  return (
    <div className="flex items-center gap-1">
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
      <FormLabel className="text-foreground-600 text-sm">Bypass sanitization</FormLabel>
      <HelpTooltipIndicator text="Return unescaped HTML content in inbox. This enables the possibility of XSS attacks from unsanitized user input." />
    </div>
  );
};
