import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class PatchWorkflowCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  identifierOrInternalId: IdentifierOrInternalId;
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
