import { IsString } from 'class-validator';
import { EnvironmentCommand } from '../../../shared/commands/project.command';

export class DeleteEnvironmentCommand extends EnvironmentCommand {
  @IsString()
  environmentId: string;

  @IsString()
  userId: string;
}
