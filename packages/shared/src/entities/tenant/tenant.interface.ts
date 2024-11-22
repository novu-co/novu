import { type EnvironmentId, type OrganizationId, type TenantCustomData, type TenantId } from '../../types';

export interface ITenantEntity {
  _id?: TenantId;

  identifier: string;

  name?: string;

  deleted?: boolean;

  createdAt: string;

  updatedAt: string;

  data?: TenantCustomData;

  _environmentId: EnvironmentId;

  _organizationId: OrganizationId;
}
