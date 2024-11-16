import { useState } from 'react';
import { FaCode } from 'react-icons/fa6';
import {
  RiDeleteBin2Line,
  RiFileCopyLine,
  RiGitPullRequestFill,
  RiMore2Fill,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiPulseFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { IEnvironment, WorkflowListResponseDto } from '@novu/shared';
import { Badge, BadgeContent } from '@/components/primitives/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/primitives/tooltip';
import TruncatedText from '@/components/truncated-text';
import { WorkflowStatus } from '@/components/workflow-status';
import { WorkflowSteps } from '@/components/workflow-steps';
import { WorkflowTags } from '@/components/workflow-tags';
import { useEnvironment } from '@/context/environment/hooks';
import { useDeleteWorkflow } from '@/hooks/use-delete-workflow';
import { useSyncWorkflow } from '@/hooks/use-sync-workflow';
import { WorkflowOriginEnum } from '@/utils/enums';
import { buildRoute, LEGACY_ROUTES, ROUTES } from '@/utils/routes';
import { ConfirmationModal } from './confirmation-modal';
import { showToast } from './primitives/sonner-helpers';
import { ToastIcon } from './primitives/sonner';

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const { deleteWorkflow, isPending } = useDeleteWorkflow({
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Deleted</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          classNames: {
            toast: 'mb-4 right-0',
          },
        },
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to delete</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          classNames: {
            toast: 'mb-4 right-0',
          },
        },
      });
    },
  });

  const onDeleteWorkflow = async () => {
    await deleteWorkflow({
      workflowId: workflow._id,
    });
  };

  return (
    <TableRow key={workflow._id} className="relative">
      <PromoteConfirmModal />
      <TableCell className="font-medium">
        <div className="flex items-center gap-1">
          {workflow.origin === WorkflowOriginEnum.EXTERNAL && (
            <Badge className="rounded-full px-1.5" variant="warning-light">
              <BadgeContent variant="warning">
                <FaCode className="size-3" />
              </BadgeContent>
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
      <TableCell>
        <WorkflowStatus status={workflow.status} />
      </TableCell>
      <TableCell>
        <WorkflowSteps steps={workflow.stepTypeOverviews} />
      </TableCell>
      <TableCell>
        <WorkflowTags tags={workflow.tags || []} />
      </TableCell>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <TableCell className="text-foreground-600 text-sm font-medium">
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
      </TooltipProvider>

      <TableCell className="w-1">
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={onDeleteWorkflow}
          title="Are you sure?"
          description={`You're about to delete the ${workflow.name}, this action cannot be undone.`}
          confirmButtonText="Delete"
          isLoading={isPending}
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
              <DropdownMenuItem>
                <RiPauseCircleLine />
                Pause workflow
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
    <TooltipProvider delayDuration={100}>
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
    </TooltipProvider>
  );
};
