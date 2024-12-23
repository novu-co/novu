import { RiChat1Fill } from 'react-icons/ri';
import { GeneratePreviewResponseDto } from '@novu/shared';

import { ChatPreview } from '@/components/workflow-editor/steps/chat/chat-preview';
import { TabsSection } from '@/components/workflow-editor/steps/tabs-section';
import { InlineToast } from '@/components/primitives/inline-toast';
import { ConfigurePreviewAccordion } from '../shared/configure-preview-accordion';

type ChatEditorPreviewProps = {
  editorValue: string;
  setEditorValue: (value: string) => void;
  previewStep: () => void;
  previewData?: GeneratePreviewResponseDto;
  isPreviewPending: boolean;
};

export const ChatEditorPreview = ({
  editorValue,
  setEditorValue,
  previewStep,
  previewData,
  isPreviewPending = false,
}: ChatEditorPreviewProps) => {
  return (
    <TabsSection>
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <RiChat1Fill className="size-3" />
          Chat template editor
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <ChatPreview isPreviewPending={isPreviewPending} previewData={previewData} />
          <InlineToast
            description="This preview shows how your message will appear. Actual rendering may vary by provider."
            className="w-full px-3"
          />
        </div>
        <ConfigurePreviewAccordion
          editorValue={editorValue}
          setEditorValue={setEditorValue}
          previewStep={previewStep}
        />
      </div>
    </TabsSection>
  );
};
