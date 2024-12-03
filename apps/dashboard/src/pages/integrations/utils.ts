import { IEnvironment, IIntegration } from '@novu/shared';
import { ITableIntegration } from './types';

export function mapToTableIntegration(integration: IIntegration, environments: IEnvironment[]): ITableIntegration {
  const environment = environments.find((env) => env._id === integration._environmentId);

  return {
    integrationId: integration._id,
    name: integration.name,
    identifier: integration.identifier,
    provider: integration.providerId,
    channel: integration.channel,
    environment: environment?.name || '',
    active: integration.active,
    conditions: integration.conditions?.map((condition) => condition.step) ?? [],
    primary: integration.primary,
    isPrimary: integration.primary,
  };
}
