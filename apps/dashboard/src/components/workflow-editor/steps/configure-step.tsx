import { Link, useParams } from 'react-router-dom';
import { RiArrowLeftSLine, RiCloseFill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { StepTypeEnum } from '@/utils/enums';
import { useStep } from './use-step';
import { InApp } from './in-app';
import { Separator } from '@/components/primitives/separator';
import { Button } from '@/components/primitives/button';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import Chat from './chat';

export function ConfigureStep() {
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '' } = useParams<{
    workflowSlug: string;
  }>();

  return (
    <motion.div
      className="flex h-full w-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.1 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex items-center gap-2.5 px-3 pb-3.5 text-sm font-medium">
        <Link
          to={buildRoute(ROUTES.EDIT_WORKFLOW, {
            environmentId: currentEnvironment?._id ?? '',
            workflowSlug,
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
            workflowSlug,
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
    </motion.div>
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
