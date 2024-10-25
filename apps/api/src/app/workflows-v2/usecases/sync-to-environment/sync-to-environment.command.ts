import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsDefined, IsString } from 'class-validator';

export class SyncToEnvironmentCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsDefined()
  identifierOrInternalId: string;

  @IsString()
  @IsDefined()
  targetEnvironmentId: string;
}
