import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { GeneratePreviewRequestDto } from '@novu/shared';

export class GeneratePreviewCommand extends EnvironmentWithUserObjectCommand {
  workflowId: string;
  stepDatabaseId: string;
  generatePreviewRequestDto: GeneratePreviewRequestDto;
}
