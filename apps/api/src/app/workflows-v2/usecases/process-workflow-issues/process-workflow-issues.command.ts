import { EnvironmentWithUserObjectCommand, GetPreferencesResponseDto } from '@novu/application-generic';
import { ControlValuesEntity, NotificationTemplateEntity } from '@novu/dal';

export class ProcessWorkflowIssuesCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
  preferences?: GetPreferencesResponseDto;
  stepIdToControlValuesMap: { [p: string]: ControlValuesEntity };
}
