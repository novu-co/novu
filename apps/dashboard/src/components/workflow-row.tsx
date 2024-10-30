import { IEnvironment, WorkflowListResponseDto, WorkflowResponseDto } from '@novu/shared';
import { RiAlertFill, RiDeleteBin2Line, RiGitPullRequestFill, RiPauseCircleLine, RiPulseFill } from 'react-icons/ri';
import { Button } from '@/components/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/primitives/table';
import { useEnvironment } from '@/context/environment/hooks';
import { WorkflowOriginEnum } from '@/utils/enums';
import { buildRoute, LEGACY_ROUTES, ROUTES } from '@/utils/routes';
import { usePromoteWorkflow } from '@/hooks/use-promote-workflow';
import { useState } from 'react';
import { Badge } from '@/components/primitives/badge';
import { BadgeContent } from '@/components/primitives/badge';
import { WorkflowStatus } from '@/components/workflow-status';
import { WorkflowSteps } from '@/components/workflow-steps';
import { WorkflowTags } from '@/components/workflow-tags';
import { FaCode } from 'react-icons/fa6';
import TruncatedText from '@/components/truncated-text';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/primitives/tooltip';
import { RiMore2Fill, RiPlayCircleLine } from 'react-icons/ri';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@/components/primitives/dialog';

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
  const { currentEnvironment } = useEnvironment();
  const { safePromote, promote, isPromotable, tooltipContent } = usePromoteWorkflow(workflow);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const handlePromote = async () => {
    const { needsConfirmation } = await safePromote();

    if (needsConfirmation) {
      setShowPromoteModal(true);
    } else {
      await promote();
    }
  };

  const isV1Workflow = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1;
  const workflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.EDIT_WORKFLOW, { workflowId: workflow._id })
    : buildRoute(ROUTES.EDIT_WORKFLOW, {
        environmentId: currentEnvironment?._id ?? '',
        workflowId: workflow._id,
      });

  return (
    <TableRow key={workflow._id} className="relative">
      <PromoteWorkflowConfirmModal open={showPromoteModal} setOpen={setShowPromoteModal} promoteWorkflow={promote} />
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
          <Link to={workflowLink} reloadDocument={isV1Workflow}>
            <TruncatedText className="cursor-pointer" text={workflow.name} />
          </Link>
        </div>
        <TruncatedText className="text-foreground-400 font-code block text-xs" text={workflow._id} />
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
      <TableCell className="text-foreground-600 text-sm font-medium">
        {new Date(workflow.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </TableCell>
      <TableCell className="w-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <RiMore2Fill />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <RiPlayCircleLine />
                Trigger workflow
              </DropdownMenuItem>
              <PromoteWorkflowMenuItem
                currentEnvironment={currentEnvironment}
                isPromotable={isPromotable}
                tooltipContent={tooltipContent}
                onPromote={handlePromote}
              />
              <DropdownMenuItem>
                <RiPulseFill />
                View activity
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <RiPauseCircleLine />
                Pause workflow
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
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

const PromoteWorkflowMenuItem = ({
  currentEnvironment,
  isPromotable,
  tooltipContent,
  onPromote,
}: {
  currentEnvironment: IEnvironment | undefined;
  isPromotable: boolean;
  tooltipContent: string | undefined;
  onPromote: () => void;
}) => {
  if (!currentEnvironment || currentEnvironment.name === 'Production') {
    return null;
  }

  if (isPromotable) {
    return (
      <DropdownMenuItem onClick={onPromote}>
        <RiGitPullRequestFill />
        Promote to Production
      </DropdownMenuItem>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenuItem disabled>
            <RiGitPullRequestFill />
            Promote to Production
          </DropdownMenuItem>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

const PromoteWorkflowConfirmModal = ({
  open,
  setOpen,
  promoteWorkflow,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  promoteWorkflow: UseMutateAsyncFunction<WorkflowResponseDto, unknown, void, void>;
}) => {
  async function onConfirm() {
    setOpen(false);
    await promoteWorkflow();
  }

  return (
    <Dialog modal open={open}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-[440px]">
          <div className="flex items-start gap-4 self-stretch">
            <div className="flex items-center justify-center gap-2 rounded-[10px] bg-[#FF84471A] p-2">
              <RiAlertFill className="text-warning size-6" />
            </div>
            <div className="flex flex-[1_0_0] flex-col items-start gap-1">
              <DialogTitle className="text-md font-medium">Promote workflow to Production</DialogTitle>
              <DialogDescription className="text-foreground-600">
                Workflow already exists in Production. Proceeding will overwrite the existing workflow.
              </DialogDescription>
            </div>
          </div>
          <DialogFooter className="[&~button]:hidden">
            <DialogClose asChild aria-label="Close">
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild aria-label="Close">
              <Button type="button" size="sm" variant="primary" onClick={onConfirm}>
                Proceed
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
