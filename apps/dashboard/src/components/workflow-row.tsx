import { IEnvironment, WorkflowListResponseDto } from '@novu/shared';
import { RiDeleteBin2Line, RiGitPullRequestFill, RiPauseCircleLine, RiPulseFill } from 'react-icons/ri';
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
import { WorkflowOriginEnum, WorkflowStatusEnum } from '@/utils/enums';
import { buildRoute, LEGACY_ROUTES, ROUTES } from '@/utils/routes';
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
import { useSyncWorkflow } from '@/hooks/use-sync-workflow';
import { HoverToCopy } from '@/components/primitives/hover-to-copy';
import { useUpdateWorkflow } from '@/hooks';
import { showToast } from './primitives/sonner-helpers';
import { ToastIcon } from './primitives/sonner';

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
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

  const { updateWorkflow } = useUpdateWorkflow({
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          classNames: {
            toast: 'ml-10 mb-4',
          },
        },
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to save</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          classNames: {
            toast: 'ml-10 mb-4',
          },
        },
      });
    },
  });

  const handlePauseWorkflow = () => {
    const activeStatus = workflow.status === WorkflowStatusEnum.ACTIVE;
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
          <Link to={workflowLink} reloadDocument={isV1Workflow}>
            <TruncatedText className="cursor-pointer" text={workflow.name} />
          </Link>
        </div>
        <HoverToCopy valueToCopy={workflow.workflowId}>
          <TruncatedText className="text-foreground-400 font-code block text-xs" text={workflow.workflowId} />
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
        <DropdownMenu>
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
              <DropdownMenuItem className="text-destructive" disabled={workflow.origin === WorkflowOriginEnum.EXTERNAL}>
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
