import { Control } from 'react-hook-form';
import { Input, InputField } from '@/components/primitives/input';
import { Separator } from '@/components/primitives/separator';
import { Switch } from '@/components/primitives/switch';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';

type IntegrationFormData = {
  name: string;
  identifier: string;
  credentials: Record<string, string>;
  active: boolean;
  check: boolean;
  primary: boolean;
  environmentId: string;
};

type GeneralSettingsProps = {
  control: Control<IntegrationFormData>;
  mode: 'create' | 'update';
  hidePrimarySelector?: boolean;
  disabledPrimary?: boolean;
};

export function GeneralSettings({ control, mode, hidePrimarySelector, disabledPrimary }: GeneralSettingsProps) {
  return (
    <div className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 flex flex-col gap-2 rounded-lg border p-3">
      <FormField
        control={control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-2">
            <FormLabel
              className="text-xs"
              htmlFor="active"
              tooltip="Disabling an integration will stop sending notifications through it."
            >
              Active Integration
            </FormLabel>
            <FormControl>
              <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {!hidePrimarySelector && (
        <FormField
          control={control}
          name="primary"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-2">
              <FormLabel
                className="text-xs"
                htmlFor="primary"
                tooltip="Primary integration will be used for all notifications by default, there can be only one primary integration per channel"
              >
                Primary Integration
              </FormLabel>
              <FormControl>
                <Switch
                  id="primary"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabledPrimary}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <Separator />

      <FormField
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-xs" htmlFor="name">
              Name
            </FormLabel>
            <FormControl>
              <InputField>
                <Input id="name" {...field} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="identifier"
        rules={{ required: 'Identifier is required' }}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-xs" htmlFor="identifier">
              Identifier
            </FormLabel>
            <FormControl>
              <InputField>
                <Input id="identifier" {...field} readOnly={mode === 'update'} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
