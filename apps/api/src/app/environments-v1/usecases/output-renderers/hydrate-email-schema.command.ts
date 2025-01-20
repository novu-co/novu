import { BaseCommand } from '@novu/application-generic';
import { IsNotEmpty, IsString } from 'class-validator';

export class HydrateEmailSchemaCommand extends BaseCommand {
  @IsString()
  emailEditor: string;
}
