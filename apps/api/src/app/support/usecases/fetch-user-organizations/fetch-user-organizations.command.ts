import { BaseCommand } from '@novu/application-generic';
import { IsArray, IsDefined, IsOptional, IsString } from 'class-validator';

export class PlainCutomer {
  @IsDefined()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class PlainTenant {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class PlainThread {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class FetchUserOrganizationsCommand extends BaseCommand {
  @IsOptional()
  @IsArray()
  cardKeys?: string[];

  @IsOptional()
  customer?: PlainCutomer | null;

  @IsOptional()
  tenant?: PlainTenant | null;

  @IsOptional()
  thread?: PlainThread | null;

  @IsDefined()
  @IsString()
  timestamp: string;
}
