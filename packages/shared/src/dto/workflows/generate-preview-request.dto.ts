import { PreviewPayload } from './preview-step-response.dto';

export enum ValidationStrategyEnum {
  VALIDATE_MISSING_PAYLOAD_VALUES_FOR_HYDRATION = 'VALIDATE_MISSING_PAYLOAD_VALUES_FOR_HYDRATION',
  VALIDATE_MISSING_CONTROL_VALUES = 'VALIDATE_MISSING_CONTROL_VALUES',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface GeneratePreviewRequestDto {
  controlValues?: Record<string, unknown>;
  previewPayload?: PreviewPayload;
}

export type { GeneratePreviewRequestDto };
