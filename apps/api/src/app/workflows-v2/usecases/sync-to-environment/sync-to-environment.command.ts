import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IdentifierOrInternalId } from '@novu/shared';
import { IsDefined, IsString } from 'class-validator';

export class SyncToEnvironmentCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsDefined()
  identifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsDefined()
  targetEnvironmentId: string;
}
