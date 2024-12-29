import { UserSessionData } from '@novu/shared';
import { IsString, IsDefined } from 'class-validator';

export class GenerateSuggestionsCommand {
  @IsDefined()
  @IsString()
  prompt: string;

  @IsDefined()
  user: UserSessionData;

  @IsString()
  mode?: 'single' | 'multiple' = 'multiple';
}
