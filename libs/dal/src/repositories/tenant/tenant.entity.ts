import { type TenantCustomData } from '@novu/shared';
import { type TenantId } from './types';
import { type EnvironmentId } from '../environment';
import { type ChangePropsValueType } from '../../types/helpers';
import { type OrganizationId } from '../organization';

export class TenantEntity {
  _id: TenantId;

  identifier: string;

  name?: string;

  deleted?: boolean;

  createdAt: string;

  updatedAt: string;

  data?: TenantCustomData;

  _environmentId: EnvironmentId;

  _organizationId: OrganizationId;
}

export type TenantDBModel = ChangePropsValueType<TenantEntity, '_environmentId' | '_organizationId'>;
