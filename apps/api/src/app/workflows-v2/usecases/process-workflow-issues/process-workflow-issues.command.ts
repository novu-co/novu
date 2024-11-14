import { EnvironmentWithUserObjectCommand, GetPreferencesResponseDto } from '@novu/application-generic';
import { ControlValuesEntity, NotificationTemplateEntity } from '@novu/dal';
import { ValidatedContentResponse } from '../validate-content';

export class ProcessWorkflowIssuesCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
  preferences?: GetPreferencesResponseDto;
  stepIdToControlValuesMap: { [p: string]: ControlValuesEntity };
  validatedContentsArray: Record<string, ValidatedContentResponse>;
}
