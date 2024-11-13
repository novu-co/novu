import { IsArray, IsOptional, IsString } from 'class-validator';
import { EnvironmentWithSubscriber } from '../../commands/project.command';

export class GetSubscriberPreferenceCommand extends EnvironmentWithSubscriber {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
