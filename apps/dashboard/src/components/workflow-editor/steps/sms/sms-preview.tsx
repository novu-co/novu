import { SmsPhone } from '@/components/workflow-editor/steps/sms/sms-phone';
import { ChannelTypeEnum, type GeneratePreviewResponseDto } from '@novu/shared';
import { ReactNode } from 'react';

const SmsPreviewContainer = ({ children }: { children: ReactNode }) => {
  return <div className="pt-2">{children}</div>;
};

export const SmsPreview = ({
  isPreviewPending,
  previewData,
}: {
  isPreviewPending: boolean;
  previewData?: GeneratePreviewResponseDto;
}) => {
  const previewResult = previewData?.result;

  if (isPreviewPending || previewData === undefined) {
    return (
      <SmsPreviewContainer>
        <SmsPhone smsBody="" isLoading={isPreviewPending} />
      </SmsPreviewContainer>
    );
  }

  const isValidSmsPreview =
    previewResult && previewResult.type === ChannelTypeEnum.SMS && previewResult.preview.body.length > 0;

  if (!isValidSmsPreview) {
    return (
      <SmsPreviewContainer>
        <SmsPhone smsBody="Preview not available" error={!isValidSmsPreview} />
      </SmsPreviewContainer>
    );
  }

  const smsBody = previewResult.preview.body;

  return (
    <SmsPreviewContainer>
      <SmsPhone smsBody={smsBody} />
    </SmsPreviewContainer>
  );
};
