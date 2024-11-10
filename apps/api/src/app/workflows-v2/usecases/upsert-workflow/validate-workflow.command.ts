import { EnvironmentWithUserObjectCommand, GetPreferencesResponseDto } from '@novu/application-generic';
import { ControlValuesEntity, NotificationTemplateEntity } from '@novu/dal';

export class ValidateWorkflowCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
  preferences?: GetPreferencesResponseDto;
  stepIdToControlValuesMap: { [p: string]: ControlValuesEntity };
}
