import { type IPreferenceChannels, type IWorkflowOverride } from '@novu/shared';

import type { OrganizationId } from '../organization';
import type { EnvironmentId } from '../environment';
import type { ChangePropsValueType } from '../../types';
import { type WorkflowOverrideId } from './types';
import { type TenantEntity } from '../tenant';
import { type NotificationTemplateEntity } from '../notification-template';

export class WorkflowOverrideEntity implements IWorkflowOverride {
  _id: WorkflowOverrideId;

  _organizationId: OrganizationId;

  _environmentId: EnvironmentId;

  _workflowId: string;

  readonly workflow?: NotificationTemplateEntity;

  _tenantId: string;

  readonly tenant?: TenantEntity;

  active: boolean;

  preferenceSettings: IPreferenceChannels;

  deleted: boolean;

  deletedAt?: string;

  deletedBy?: string;

  createdAt: string;

  updatedAt?: string;
}

export type WorkflowOverrideDBModel = ChangePropsValueType<
  WorkflowOverrideEntity,
  '_environmentId' | '_organizationId' | '_workflowId' | '_tenantId'
>;
