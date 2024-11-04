import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { SidebarFooter, SidebarHeader } from '@/components/side-navigation/Sidebar';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { useEnvironment } from '@/context/environment/hooks';
import { StepTypeEnum } from '@/utils/enums';
import { buildRoute, ROUTES } from '@/utils/routes';
import { motion } from 'framer-motion';
import { RiArrowLeftSLine, RiCloseFill, RiDeleteBin2Line } from 'react-icons/ri';
import { Link, useParams } from 'react-router-dom';
import Chat from './chat';
import { InApp } from './in-app';
import { useStep } from './use-step';

export function ConfigureStep() {
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '' } = useParams<{
    workflowSlug: string;
  }>();
  const { isReadOnly } = useWorkflowEditorContext();

  return (
    <motion.div
      className="flex h-full w-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.1 }}
      transition={{ duration: 0.1 }}
    >
      <SidebarHeader className="flex items-center gap-2.5 text-sm font-medium">
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
      </SidebarHeader>

      <Separator />

      <Step />

      <Separator />

      {!isReadOnly && (
        <>
          <SidebarFooter>
            <Separator />
            <Button variant="ghostDestructive" type="button">
              <RiDeleteBin2Line className="size-4" />
              Delete step
            </Button>
          </SidebarFooter>
        </>
      )}
    </motion.div>
  );
}

const Step = () => {
  const { stepType: channel } = useStep();
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
