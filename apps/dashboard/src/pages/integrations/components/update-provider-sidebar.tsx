import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/primitives/sheet';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Switch } from '@/components/primitives/switch';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useUpdateIntegration } from '@/hooks/use-update-integration';
import { IIntegration } from '@novu/shared';
import { Separator } from '@/components/primitives/separator';
import { Badge } from '@/components/primitives/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/primitives/alert-dialog';
import { Info, Save, Trash2 } from 'lucide-react';
import { SecretInput } from '@/components/primitives/secret-input';
import { CredentialsKeyEnum } from '@novu/shared';
import { useFetchIntegrations } from '../../../hooks/use-fetch-integrations';

const secureCredentials = [
  CredentialsKeyEnum.ApiKey,
  CredentialsKeyEnum.ApiToken,
  CredentialsKeyEnum.SecretKey,
  CredentialsKeyEnum.Token,
  CredentialsKeyEnum.Password,
  CredentialsKeyEnum.ServiceAccount,
];

interface UpdateProviderSidebarProps {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
}

interface UpdateIntegrationFormData {
  name: string;
  identifier: string;
  active: boolean;
  primary: boolean;
  credentials: Record<string, string>;
}

function mapIntegrationToFormData(integration: IIntegration): UpdateIntegrationFormData {
  const credentials: Record<string, string> = {};
  if (integration.credentials) {
    Object.entries(integration.credentials).forEach(([key, value]) => {
      credentials[key] = value as string;
    });
  }

  return {
    name: integration.name,
    identifier: integration.identifier,
    active: integration.active,
    primary: integration.primary ?? false,
    credentials,
  };
}

export function UpdateProviderSidebar({ isOpened, integrationId, onClose }: UpdateProviderSidebarProps) {
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();
  const { mutateAsync: updateIntegration, isLoading } = useUpdateIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const integration = integrations?.find((i) => i._id === integrationId);
  const provider = providers?.find((p: IProvider) => p.id === integration?.providerId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateIntegrationFormData>({
    values: integration ? mapIntegrationToFormData(integration) : undefined,
  });

  const onSubmit = useCallback(
    async (data: UpdateIntegrationFormData) => {
      if (!integration) return;

      try {
        await updateIntegration({
          integrationId: integration._id,
          data: {
            name: data.name,
            identifier: data.identifier,
            active: data.active,
            primary: data.primary,
            credentials: data.credentials,
          },
        });
        onClose();
      } catch (error) {
        console.error('Failed to update integration:', error);
      }
    },
    [integration, updateIntegration, onClose]
  );

  const onDelete = useCallback(async () => {
    if (!integration) return;
    // TODO: Implement delete functionality
    setIsDeleteDialogOpen(false);
    onClose();
  }, [integration, onClose]);

  if (!integration || !provider) {
    return null;
  }

  return (
    <>
      <Sheet open={isOpened} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
            <SheetHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-4">
                <div className="relative overflow-hidden rounded-lg border bg-white p-2 shadow-sm">
                  <img
                    src={`/static/images/providers/dark/square/${provider.id}.svg`}
                    alt={provider.displayName}
                    className="h-10 w-10"
                    onError={(e) => {
                      e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <SheetTitle>{provider.displayName}</SheetTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{integration.channel}</Badge>
                    {integration.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                    {integration.primary && <Badge variant="soft">Primary</Badge>}
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-muted-foreground text-sm font-medium">General Settings</h3>
                  {provider.description && (
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3" />
                      <span>{provider.description}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="My Email Provider"
                        className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identifier">Identifier</Label>
                      <Input
                        id="identifier"
                        placeholder="my-email-provider"
                        className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('identifier', { required: 'Identifier is required' })}
                      />
                      {errors.identifier && <p className="text-sm text-red-500">{errors.identifier.message}</p>}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="active">Active</Label>
                        <div className="text-muted-foreground text-[0.8rem]">Enable or disable this integration</div>
                      </div>
                      <Switch id="active" {...register('active')} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="primary">Primary Provider</Label>
                        <div className="text-muted-foreground text-[0.8rem]">
                          Set as the primary provider for {integration.channel}
                        </div>
                      </div>
                      <Switch id="primary" {...register('primary')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-medium">Provider Credentials</h3>
                <div className="space-y-4 rounded-lg border p-4">
                  {provider.credentials.map((credential) => (
                    <div key={credential.key} className="space-y-2">
                      <Label htmlFor={credential.key}>{credential.displayName}</Label>
                      {credential.type === 'secret' ||
                      secureCredentials.includes(credential.key as CredentialsKeyEnum) ? (
                        <SecretInput
                          id={credential.key}
                          placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                          register={register}
                          registerKey={`credentials.${credential.key}`}
                          registerOptions={{
                            required: credential.required ? `${credential.displayName} is required` : false,
                          }}
                        />
                      ) : (
                        <Input
                          id={credential.key}
                          type="text"
                          placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                          className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...register(`credentials.${credential.key}`, {
                            required: credential.required ? `${credential.displayName} is required` : false,
                          })}
                        />
                      )}
                      {credential.description && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Info className="h-3 w-3" />
                          <span>{credential.description}</span>
                        </div>
                      )}
                      {errors.credentials?.[credential.key] && (
                        <p className="text-sm text-red-500">{errors.credentials[credential.key]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-2">
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Integration
                </Button>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isDirty || isLoading} className="min-w-[100px]">
                    {isLoading ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this integration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Integration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
