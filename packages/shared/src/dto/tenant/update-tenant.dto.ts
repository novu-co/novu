import { type IConstructTenantDto } from './create-tenant.dto';

export interface IUpdateTenantDto extends IConstructTenantDto {
  name?: string;
  identifier?: string;
}
