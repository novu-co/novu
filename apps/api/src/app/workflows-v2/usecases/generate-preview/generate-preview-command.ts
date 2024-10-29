import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { GeneratePreviewRequestDto } from '@novu/shared/dist/cjs/dto/workflows/generate-preview-request.dto';

export class GeneratePreviewCommand extends EnvironmentWithUserObjectCommand {
  workflowId: string;
  stepDatabaseId: string;
  generatePreviewRequestDto: GeneratePreviewRequestDto;
}
