import { StepTypeEnum } from '@/utils/enums';
import { useStep } from './use-step';
import { InApp } from './in-app';
import { Separator } from '@/components/primitives/separator';
import { RiArrowLeftSLine, RiCloseFill } from 'react-icons/ri';
import { Button } from '@/components/primitives/button';

export function ConfigureStep() {
  return (
    <aside className="text-foreground-950 flex h-full w-[300px] max-w-[350px] flex-col border-l pb-5 pt-3.5 [&_input]:text-xs [&_input]:text-neutral-600 [&_label]:text-xs [&_label]:font-medium [&_textarea]:text-xs [&_textarea]:text-neutral-600">
      <div className="flex items-center gap-2.5 px-3 pb-3.5 text-sm font-medium">
        <Button variant="link" size="icon" className="size-4" type="button">
          <RiArrowLeftSLine />
        </Button>
        <span>Configure Step</span>
        <Button variant="link" size="icon" className="ml-auto size-4" type="button">
          <RiCloseFill />
        </Button>
      </div>
      <Separator />
      <Step />
    </aside>
  );
}

const Step = () => {
  const { channel } = useStep();
  switch (channel) {
    case StepTypeEnum.IN_APP:
      return <InApp />;

    case StepTypeEnum.EMAIL:
      return 'Email';

    case StepTypeEnum.TRIGGER:
      return <>TRIGGER</>;

    case StepTypeEnum.SMS:
      return 'sms';

    case StepTypeEnum.CHAT:
      return 'chat';

    case StepTypeEnum.PUSH:
      return 'Push';

    case StepTypeEnum.DELAY:
      return 'Delay';

    case StepTypeEnum.DIGEST:
      return 'Digest';

    case StepTypeEnum.CUSTOM:
      return 'Custom';

    default:
      return <>Unknown Step</>;
  }
};
