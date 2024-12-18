import { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input, InputField } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Separator } from '@/components/primitives/separator';
import { Switch } from '@/components/primitives/switch';
import { HelpTooltipIndicator } from '@/components/primitives/help-tooltip-indicator';
import { Controller } from 'react-hook-form';

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
  register: UseFormRegister<IntegrationFormData>;
  errors: FieldErrors<IntegrationFormData>;
  mode: 'create' | 'update';
  hidePrimarySelector?: boolean;
  disabledPrimary?: boolean;
};

export function GeneralSettings({
  control,
  register,
  errors,
  mode,
  hidePrimarySelector,
  disabledPrimary,
}: GeneralSettingsProps) {
  return (
    <div className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs" htmlFor="active">
          Active Integration{' '}
          <HelpTooltipIndicator
            className="relative top-1"
            size="4"
            text="Disabling an integration will stop sending notifications through it."
          />
        </Label>
        <Controller
          control={control}
          name="active"
          render={({ field: { onChange, value } }) => <Switch id="active" checked={value} onCheckedChange={onChange} />}
        />
      </div>
      {!hidePrimarySelector && (
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs" htmlFor="primary">
            Primary Integration{' '}
            <HelpTooltipIndicator
              className="relative top-1"
              size="4"
              text="Primary integration will be used for all notifications by default, there can be only one primary integration per channel"
            />
          </Label>

          <Controller
            control={control}
            name="primary"
            render={({ field: { onChange, value } }) => (
              <Switch id="primary" checked={value} onCheckedChange={onChange} disabled={disabledPrimary} />
            )}
          />
        </div>
      )}
      <Separator />

      <div className="space-y-2">
        <Label className="text-xs" htmlFor="name">
          Name
        </Label>
        <InputField>
          <Input id="name" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </InputField>
      </div>
      <div className="space-y-2">
        <Label className="text-xs" htmlFor="identifier">
          Identifier
        </Label>
        <InputField>
          <Input
            id="identifier"
            {...register('identifier', { required: 'Identifier is required' })}
            readOnly={mode === 'update'}
          />
          {errors.identifier && <p className="text-sm text-red-500">{errors.identifier.message}</p>}
        </InputField>
      </div>
    </div>
  );
}
