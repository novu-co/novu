import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { PreferencesTypeEnum } from '@novu/shared';
import { EnvironmentWithUserCommand } from '../../commands';

export class DeletePreferencesCommand extends EnvironmentWithUserCommand {
  @IsNotEmpty()
  @IsMongoId()
  readonly templateId: string;

  @IsNotEmpty()
  @IsEnum(PreferencesTypeEnum)
  readonly type: PreferencesTypeEnum;
}
