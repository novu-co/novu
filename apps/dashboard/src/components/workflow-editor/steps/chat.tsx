import { Separator } from '@/components/primitives/separator';
import { CommonFields } from './common-fields';
import { SdkBanner } from './sdk-banner';
import { DeleteStepButton } from './delete-step-button';

export default function Chat() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 p-3">
        <CommonFields />
      </div>
      <Separator />
      <div className="px-3 py-4">
        <SdkBanner />
      </div>
      <Separator />
      <DeleteStepButton />
    </div>
  );
}
