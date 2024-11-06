import { Link, useNavigate, useParams } from 'react-router-dom';
import { RiArrowLeftSLine, RiCloseFill, RiDeleteBin2Line } from 'react-icons/ri';
import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { SidebarFooter, SidebarHeader } from '@/components/side-navigation/Sidebar';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { useEnvironment } from '@/context/environment/hooks';
import { StepTypeEnum } from '@/utils/enums';
import { buildRoute, ROUTES } from '@/utils/routes';
import { motion } from 'framer-motion';
import { ConfigureInApp } from './in-app/configure-in-app';
import { useStep } from './use-step';
import Chat from './chat';
import { useState } from 'react';
import { ConfirmationModal } from '@/components/confirmation-modal';

export function ConfigureStep() {
  const { step } = useStep();
  const navigate = useNavigate();
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '', stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const { isReadOnly, deleteStep } = useWorkflowEditorContext();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteStep = () => {
    deleteStep(stepSlug);
    navigate(buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug: currentEnvironment?.slug ?? '', workflowSlug }));
  };

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
            environmentSlug: currentEnvironment?.slug ?? '',
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
            environmentSlug: currentEnvironment?.slug ?? '',
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

      <Step stepType={step?.type} />

      <Separator />

      {!isReadOnly && (
        <>
          <SidebarFooter>
            <Separator />
            <ConfirmationModal
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
              onConfirm={onDeleteStep}
              title="Are you sure?"
              description={`You're about to delete the ${step?.name}, this action cannot be undone.`}
              confirmButtonText="Delete"
            />
            <Button
              variant="ghostDestructive"
              className="gap-1.5 text-xs"
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <RiDeleteBin2Line className="size-4" />
              Delete step
            </Button>
          </SidebarFooter>
        </>
      )}
    </motion.div>
  );
}

const Step = ({ stepType }: { stepType?: StepTypeEnum }) => {
  switch (stepType) {
    case StepTypeEnum.IN_APP:
      return <ConfigureInApp />;

    /**
     * TODO: Add other step types here
     * For now, it is just a placeholder with the use sdk banner
     */
    default:
      return <Chat />;
  }
};
