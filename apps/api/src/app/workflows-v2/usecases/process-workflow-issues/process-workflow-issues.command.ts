import { EnvironmentWithUserObjectCommand, GetPreferencesResponseDto } from '@novu/application-generic';
import { NotificationTemplateEntity } from '@novu/dal';
import { ValidatedContentResponse } from '../validate-content';

export class ProcessWorkflowIssuesCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
  preferences?: GetPreferencesResponseDto;
  validatedContentsArray: Record<string, ValidatedContentResponse>;
}
