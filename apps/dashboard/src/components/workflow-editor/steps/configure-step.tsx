import { StepTypeEnum } from '@/utils/enums';
import { useStep } from './use-step';
import { InApp } from './in-app';
import { Separator } from '@/components/primitives/separator';
import { RiArrowLeftSLine, RiCloseFill } from 'react-icons/ri';
import { Button } from '@/components/primitives/button';
import { Link, useParams } from 'react-router-dom';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import Chat from './chat';

export function ConfigureStep() {
  const { currentEnvironment } = useEnvironment();
  const { workflowId = '' } = useParams<{
    workflowId: string;
  }>();

  return (
    <aside className="text-foreground-950 flex h-full w-[300px] max-w-[350px] flex-col border-l pb-5 pt-3.5 [&_input]:text-xs [&_input]:text-neutral-600 [&_label]:text-xs [&_label]:font-medium [&_textarea]:text-xs [&_textarea]:text-neutral-600">
      <div className="flex items-center gap-2.5 px-3 pb-3.5 text-sm font-medium">
        <Link
          to={buildRoute(ROUTES.EDIT_WORKFLOW, {
            environmentId: currentEnvironment?._id ?? '',
            workflowId,
          })}
          className="flex items-center"
        >
          <Button variant="link" size="icon" className="size-4" type="button">
            <RiArrowLeftSLine />
          </Button>
        </Link>
        <span>Configure Step</span>
        <Link
          to={buildRoute(ROUTES.EDIT_WORKFLOW, {
            environmentId: currentEnvironment?._id ?? '',
            workflowId,
          })}
          className="ml-auto flex items-center"
        >
          <Button variant="link" size="icon" className="size-4" type="button">
            <RiCloseFill />
          </Button>
        </Link>
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

    /**
     * TODO: Add other step types here
     * For now, it is just a placeholder with the use sdk banner
     */
    default:
      return <Chat />;
  }
};
