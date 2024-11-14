import { IsDefined, IsString } from 'class-validator';
import { EnvironmentWithUserCommand } from '../../../commands';

export class GetWorkflowByIdsCommand extends EnvironmentWithUserCommand {
  @IsString()
  @IsDefined()
  identifierOrInternalId: string;
}
