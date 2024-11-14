// Define the ValidatedContent interface
import { ContentIssue, PreviewPayload } from '@novu/shared';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ValidatedContentResponse {
  finalPayload: PreviewPayload;
  finalControlValues: Record<string, unknown>;
  issues: Record<string, ContentIssue[]>;
}
