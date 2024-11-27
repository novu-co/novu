import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RiArrowLeftSLine, RiCloseFill, RiDeleteBin2Line } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { SidebarFooter, SidebarHeader } from '@/components/side-navigation/sidebar';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useStep } from './use-step';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ConfigureStepContent } from './configure-step-content';
import { PageMeta } from '@/components/page-meta';
import { StepEditorProvider } from '@/components/workflow-editor/steps/step-editor-provider';
import { EXCLUDED_EDITOR_TYPES } from '@/utils/constants';
import TruncatedText from '@/components/truncated-text';

const ConfigureStepInternal = () => {
  const { step } = useStep();
  const navigate = useNavigate();
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '', stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const { isReadOnly: isWorkflowReadOnly, deleteStep } = useWorkflowEditorContext();

  const isReadOnly = isWorkflowReadOnly || EXCLUDED_EDITOR_TYPES.includes(step?.type ?? '');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteStep = () => {
    deleteStep(stepSlug);
    navigate(buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug: currentEnvironment?.slug ?? '', workflowSlug }));
  };

  return (
    <>
      <PageMeta title={`Configure ${step?.name}`} />
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

        {step && <ConfigureStepContent />}

        <Separator />

        {!isReadOnly && (
          <>
            <SidebarFooter>
              <Separator />
              <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={onDeleteStep}
                title="Proceeding will delete the step"
                description={
                  <>
                    You're about to delete the{' '}
                    <strong>
                      <TruncatedText className="max-w-[32ch]">{step?.name}</TruncatedText>
                    </strong>{' '}
                    step, this action is permanent.
                  </>
                }
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
    </>
  );
};

export const ConfigureStep = () => {
  return (
    <StepEditorProvider>
      <ConfigureStepInternal />
    </StepEditorProvider>
  );
};
