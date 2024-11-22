import { type SoftDeleteModel } from 'mongoose-delete';

import { BaseRepository } from '../base-repository';
import { type TenantDBModel, TenantEntity } from './tenant.entity';
import { Tenant } from './tenant.schema';
import { type EnforceEnvId, EnforceEnvOrOrgIds } from '../../types';

export class TenantRepository extends BaseRepository<TenantDBModel, TenantEntity, EnforceEnvId> {
  private tenant: SoftDeleteModel;

  constructor() {
    super(Tenant, TenantEntity);
    this.tenant = Tenant;
  }
}
