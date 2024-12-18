import { Control } from 'react-hook-form';
import { Input, InputField } from '@/components/primitives/input';
import { Switch } from '@/components/primitives/switch';
import { SecretInput } from '@/components/primitives/secret-input';
import { Info } from 'lucide-react';
import { CredentialsKeyEnum, IProviderConfig } from '@novu/shared';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/primitives/form/form';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '../../../utils/constants';

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
};

const SECURE_CREDENTIALS = [
  CredentialsKeyEnum.ApiKey,
  CredentialsKeyEnum.ApiToken,
  CredentialsKeyEnum.SecretKey,
  CredentialsKeyEnum.Token,
  CredentialsKeyEnum.Password,
  CredentialsKeyEnum.ServiceAccount,
];

export function CredentialsSection({ provider, control }: CredentialsSectionProps) {
  return (
    <div className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 flex flex-col gap-2 rounded-lg border p-3">
      {provider?.credentials?.map((credential) => (
        <FormField
          key={credential.key}
          control={control}
          name={`credentials.${credential.key}`}
          rules={{ required: credential.required ? `${credential.displayName} is required` : false }}
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel htmlFor={credential.key}>
                {credential.displayName}
                {credential.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {credential.type === 'switch' ? (
                <div className="flex items-center justify-between gap-2">
                  <FormControl>
                    <Switch id={credential.key} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                  </FormControl>
                </div>
              ) : credential.type === 'secret' || SECURE_CREDENTIALS.includes(credential.key as CredentialsKeyEnum) ? (
                <FormControl>
                  <SecretInput
                    id={credential.key}
                    placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
              ) : (
                <FormControl>
                  <InputField>
                    <Input
                      id={credential.key}
                      type="text"
                      {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
                      placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                      {...field}
                    />
                  </InputField>
                </FormControl>
              )}
              {credential.description && (
                <FormDescription className="text-foreground-400 flex gap-1 text-xs">
                  <Info className="relative top-[2px] h-3 w-3" />
                  <span>{credential.description}</span>
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
