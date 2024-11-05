import { GeneratePreviewRequestDto } from '@novu/shared';
import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';

export class GeneratePreviewCommand extends EnvironmentWithUserObjectCommand {
  workflowId: string;
  stepDatabaseId: string;
  generatePreviewRequestDto: GeneratePreviewRequestDto;
}
