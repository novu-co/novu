import { IsNotEmpty, IsString } from 'class-validator';
import { EnvironmentWithUserCommand } from '../../commands';

export class DeleteControlValuesCommand extends EnvironmentWithUserCommand {
  @IsString()
  @IsNotEmpty()
  readonly workflowId: string;

  @IsString()
  @IsNotEmpty()
  readonly stepId: string;
}
