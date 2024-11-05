import { BaseCommand } from '@novu/application-generic';
import { IsDefined, IsString } from 'class-validator';

export class CreateSupportThreadCommand extends BaseCommand {
  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  @IsString()
  text: string;

  @IsDefined()
  @IsString()
  email: string;

  @IsDefined()
  @IsString()
  firstName: string;

  @IsDefined()
  @IsString()
  lastName: string;
}
