import { IsDefined, IsOptional, IsString } from 'class-validator';
import { BaseCommand } from '@novu/application-generic';

export class SessionCommand extends BaseCommand {
  @IsDefined()
  @IsString()
  readonly applicationIdentifier: string;

  @IsString()
  @IsOptional()
  readonly subscriberHash?: string;

  @IsDefined()
  @IsString()
  readonly subscriberId: string;

  @IsOptional()
  @IsString()
  readonly origin?: string;
}
