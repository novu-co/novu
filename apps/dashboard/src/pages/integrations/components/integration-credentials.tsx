import { Control, UseFormRegister, FieldErrors, Controller } from 'react-hook-form';
import { Input, InputField } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Switch } from '@/components/primitives/switch';
import { SecretInput } from '@/components/primitives/secret-input';
import { Info } from 'lucide-react';
import { CredentialsKeyEnum, IProviderConfig } from '@novu/shared';

type IntegrationFormData = {
  name: string;
  identifier: string;
  credentials: Record<string, string>;
  active: boolean;
  check: boolean;
  primary: boolean;
  environmentId: string;
};

type CredentialsSectionProps = {
  provider?: IProviderConfig;
  control: Control<IntegrationFormData>;
  register: UseFormRegister<IntegrationFormData>;
  errors: FieldErrors<IntegrationFormData>;
};

const SECURE_CREDENTIALS = [
  CredentialsKeyEnum.ApiKey,
  CredentialsKeyEnum.ApiToken,
  CredentialsKeyEnum.SecretKey,
  CredentialsKeyEnum.Token,
  CredentialsKeyEnum.Password,
  CredentialsKeyEnum.ServiceAccount,
];

export function CredentialsSection({ provider, register, control, errors }: CredentialsSectionProps) {
  return (
    <div className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 flex flex-col gap-2 rounded-lg border p-3">
      {provider?.credentials?.map((credential) => (
        <div key={credential.key} className="space-y-2">
          <Label htmlFor={credential.key}>
            {credential.displayName}
            {credential.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {credential.type === 'switch' ? (
            <div className="flex items-center justify-between gap-2">
              <Controller
                control={control}
                name={`credentials.${credential.key}`}
                render={({ field: { onChange, value } }) => (
                  <Switch id={credential.key} checked={Boolean(value)} onCheckedChange={onChange} />
                )}
              />
            </div>
          ) : credential.type === 'secret' || SECURE_CREDENTIALS.includes(credential.key as CredentialsKeyEnum) ? (
            <InputField className="flex overflow-hidden pr-0">
              <SecretInput
                id={credential.key}
                placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                register={register}
                registerKey={`credentials.${credential.key}`}
                registerOptions={{
                  required: credential.required ? `${credential.displayName} is required` : false,
                }}
              />
            </InputField>
          ) : (
            <InputField>
              <Input
                id={credential.key}
                type="text"
                placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                {...register(`credentials.${credential.key}`, {
                  required: credential.required ? `${credential.displayName} is required` : false,
                })}
              />
            </InputField>
          )}
          {credential.description && (
            <div className="text-foreground-400 flex gap-1 text-xs">
              <Info className="relative top-[2px] h-3 w-3" />
              <span>{credential.description}</span>
            </div>
          )}
          {errors.credentials?.[credential.key] && (
            <p className="text-sm text-red-500">{errors.credentials[credential.key]?.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
