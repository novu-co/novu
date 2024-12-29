import { UserSessionData } from '@novu/shared';
import { IsString } from 'class-validator';

export class GenerateSuggestionsCommand {
  @IsString()
  prompt: string;

  user: UserSessionData;

  static create(data: { prompt: string; user: UserSessionData }) {
    const command = new GenerateSuggestionsCommand();

    command.prompt = data.prompt;
    command.user = data.user;

    return command;
  }
}
