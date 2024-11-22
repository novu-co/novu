import { type IPreferenceChannels } from '../subscriber-preference';
import { type EnvironmentId, type OrganizationId, type WorkflowOverrideId } from '../../types';
import { type ITenantEntity } from '../tenant';
import { type INotificationTemplate } from '../notification-template';

export interface IWorkflowOverride {
  _id?: WorkflowOverrideId;

  _organizationId: OrganizationId;

  _environmentId: EnvironmentId;

  _workflowId: string;

  readonly workflow?: INotificationTemplate;

  _tenantId: string;

  readonly tenant?: ITenantEntity;

  active: boolean;

  preferenceSettings: IPreferenceChannels;

  deleted: boolean;

  deletedAt?: string;

  deletedBy?: string;

  createdAt: string;

  updatedAt?: string;
}
