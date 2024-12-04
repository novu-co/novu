import { IsString } from 'class-validator';
import { EnvironmentCommand } from '@novu/application-generic';

export class UsageInsightsCommand extends EnvironmentCommand {
  @IsString()
  organizationId: string;
}
