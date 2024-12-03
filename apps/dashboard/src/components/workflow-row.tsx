import { useState } from 'react';
import { FaCode } from 'react-icons/fa6';
import {
  RiDeleteBin2Line,
  RiFileCopyLine,
  RiFlashlightLine,
  RiGitPullRequestFill,
  RiMore2Fill,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiPulseFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { type ExternalToast } from 'sonner';
import { IEnvironment, WorkflowListResponseDto } from '@novu/shared';
import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { HoverToCopy } from '@/components/primitives/hover-to-copy';
import { TableCell, TableRow } from '@/components/primitives/table';
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from '@/components/primitives/tooltip';
import TruncatedText from '@/components/truncated-text';
import { WorkflowStatus } from '@/components/workflow-status';
import { WorkflowSteps } from '@/components/workflow-steps';
import { WorkflowTags } from '@/components/workflow-tags';
import { useEnvironment } from '@/context/environment/hooks';
import { useDeleteWorkflow } from '@/hooks/use-delete-workflow';
import { useSyncWorkflow } from '@/hooks/use-sync-workflow';
import { WorkflowOriginEnum, WorkflowStatusEnum } from '@/utils/enums';
import { buildRoute, LEGACY_ROUTES, ROUTES } from '@/utils/routes';
import { ConfirmationModal } from './confirmation-modal';
import { showToast } from './primitives/sonner-helpers';
import { ToastIcon } from './primitives/sonner';
import { usePatchWorkflow } from '@/hooks/use-patch-workflow';
import { PauseModalDescription, PAUSE_MODAL_TITLE } from '@/components/pause-workflow-dialog';

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

const toastOptions: ExternalToast = {
  position: 'bottom-right',
  classNames: {
    toast: 'mb-4 right-0',
  },
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const { currentEnvironment } = useEnvironment();
  const { safeSync, isSyncable, tooltipContent, PromoteConfirmModal } = useSyncWorkflow(workflow);

  const isV1Workflow = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1;
  const workflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.EDIT_WORKFLOW, {
        workflowId: workflow._id,
      })
    : buildRoute(ROUTES.EDIT_WORKFLOW, {
        environmentSlug: currentEnvironment?.slug ?? '',
        workflowSlug: workflow.slug,
      });

  const triggerWorkflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.TEST_WORKFLOW, { workflowId: workflow._id })
    : buildRoute(ROUTES.TEST_WORKFLOW, {
        environmentSlug: currentEnvironment?.slug ?? '',
        workflowSlug: workflow.slug,
      });

  const { deleteWorkflow, isPending: isDeleteWorkflowPending } = useDeleteWorkflow({
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">
              Deleted workflow <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to delete workflow <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
  });

  const onDeleteWorkflow = async () => {
    await deleteWorkflow({
      workflowId: workflow._id,
    });
  };

  const { patchWorkflow, isPending: isPauseWorkflowPending } = usePatchWorkflow({
    onSuccess: (data) => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">
              {data.active ? 'Enabled' : 'Paused'} workflow <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
    onError: (_, { workflow }) => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to {workflow.active ? 'enable' : 'pause'} workflow{' '}
              <span className="font-bold">{workflow.name}</span>.
            </span>
          </>
        ),
        options: toastOptions,
      });
    },
  });

  const onPauseWorkflow = async () => {
    await patchWorkflow({
      workflowId: workflow._id,
      workflow: {
        active: workflow.status === WorkflowStatusEnum.ACTIVE ? false : true,
      },
    });
  };

  const handlePauseWorkflow = () => {
    if (workflow.status === WorkflowStatusEnum.ACTIVE) {
      setIsPauseModalOpen(true);
      return;
    }
    onPauseWorkflow();
  };

  return (
    <TableRow key={workflow._id} className="relative">
      <PromoteConfirmModal />
      <TableCell className="font-medium">
        <div className="flex items-center gap-1">
          {workflow.origin === WorkflowOriginEnum.EXTERNAL && (
            <Badge variant="warning" kind="pill">
              <FaCode className="size-3" />
            </Badge>
          )}
          {/**
           * reloadDocument is needed for v1 workflows to reload the document when the user navigates to the workflow editor
           */}
          <TruncatedText className="max-w-[32ch]" asChild>
            <Link to={workflowLink} reloadDocument={isV1Workflow}>
              {workflow.name}
            </Link>
          </TruncatedText>
        </div>
        <HoverToCopy className="group flex items-center gap-1" valueToCopy={workflow.workflowId}>
          <TruncatedText className="text-foreground-400 font-code block text-xs">{workflow.workflowId}</TruncatedText>
          <RiFileCopyLine className="text-foreground-400 invisible size-3 group-hover:visible" />
        </HoverToCopy>
      </TableCell>
      <TableCell className="min-w-[200px]">
        <WorkflowStatus status={workflow.status} />
      </TableCell>
      <TableCell>
        <WorkflowSteps steps={workflow.stepTypeOverviews} />
      </TableCell>
      <TableCell>
        <WorkflowTags tags={workflow.tags || []} />
      </TableCell>

      <Tooltip>
        <TooltipTrigger asChild>
          <TableCell className="text-foreground-600 min-w-[180px] text-sm font-medium">
            {new Date(workflow.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </TableCell>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="start">{new Date(workflow.updatedAt).toUTCString()}</TooltipContent>
        </TooltipPortal>
      </Tooltip>

      <TableCell className="w-1">
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={onDeleteWorkflow}
          title="Are you sure?"
          description={
            <>
              You're about to delete the{' '}
              <TruncatedText className="max-w-[32ch] font-bold">{workflow.name}</TruncatedText> workflow, this action is
              permanent. <br />
              <br />
              You won't be able to trigger this workflow anymore.
            </>
          }
          confirmButtonText="Delete"
          isLoading={isDeleteWorkflowPending}
        />
        <ConfirmationModal
          open={isPauseModalOpen}
          onOpenChange={setIsPauseModalOpen}
          onConfirm={async () => {
            await onPauseWorkflow();
            setIsPauseModalOpen(false);
          }}
          title={PAUSE_MODAL_TITLE}
          description={<PauseModalDescription workflowName={workflow.name} />}
          confirmButtonText="Proceed"
          isLoading={isPauseWorkflowPending}
        />
        {/**
         * Needs modal={false} to prevent the click freeze after the modal is closed
         */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <RiMore2Fill />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <Link to={triggerWorkflowLink} reloadDocument={isV1Workflow}>
                <DropdownMenuItem className="cursor-pointer">
                  <RiPlayCircleLine />
                  Trigger workflow
                </DropdownMenuItem>
              </Link>
              <SyncWorkflowMenuItem
                currentEnvironment={currentEnvironment}
                isSyncable={isSyncable}
                tooltipContent={tooltipContent}
                onSync={safeSync}
              />
              <Link to={LEGACY_ROUTES.ACTIVITY_FEED} reloadDocument>
                <DropdownMenuItem className="cursor-pointer">
                  <RiPulseFill />
                  View activity
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="*:cursor-pointer">
              <DropdownMenuItem onClick={handlePauseWorkflow} disabled={workflow.status === WorkflowStatusEnum.ERROR}>
                {workflow.status === WorkflowStatusEnum.ACTIVE ? (
                  <>
                    <RiPauseCircleLine />
                    Pause workflow
                  </>
                ) : (
                  <>
                    <RiFlashlightLine />
                    Enable workflow
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={workflow.origin === WorkflowOriginEnum.EXTERNAL}
                onClick={() => {
                  setIsDeleteModalOpen(true);
                }}
              >
                <RiDeleteBin2Line />
                Delete workflow
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const SyncWorkflowMenuItem = ({
  currentEnvironment,
  isSyncable,
  tooltipContent,
  onSync,
}: {
  currentEnvironment: IEnvironment | undefined;
  isSyncable: boolean;
  tooltipContent: string | undefined;
  onSync: () => void;
}) => {
  const syncToLabel = `Sync to ${currentEnvironment?.name === 'Production' ? 'Development' : 'Production'}`;

  if (isSyncable) {
    return (
      <DropdownMenuItem onClick={onSync}>
        <RiGitPullRequestFill />
        {syncToLabel}
      </DropdownMenuItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <DropdownMenuItem disabled>
          <RiGitPullRequestFill />
          {syncToLabel}
        </DropdownMenuItem>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};
