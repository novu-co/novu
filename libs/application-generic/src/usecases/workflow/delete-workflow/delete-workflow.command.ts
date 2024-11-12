import { IsDefined, IsString } from 'class-validator';
import { EnvironmentWithUserCommand } from '../../../commands';

export class DeleteWorkflowCommand extends EnvironmentWithUserCommand {
  @IsString()
  @IsDefined()
  identifierOrInternalId: string;
}
