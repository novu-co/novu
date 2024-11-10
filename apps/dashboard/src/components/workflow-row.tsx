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
import { WorkflowOriginEnum } from '@/utils/enums';
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

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
  const { currentEnvironment } = useEnvironment();
  const { safeSync, isSyncable, tooltipContent, PromoteConfirmModal } = useSyncWorkflow(workflow);

  const isV1Workflow = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1;
  const workflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.EDIT_WORKFLOW, {
        workflowSlug: workflow.slug,
      })
    : buildRoute(ROUTES.EDIT_WORKFLOW, {
        environmentSlug: currentEnvironment?.slug ?? '',
        workflowSlug: workflow.slug,
      });

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
              <SyncWorkflowMenuItem
                currentEnvironment={currentEnvironment}
                isSyncable={isSyncable}
                tooltipContent={tooltipContent}
                onSync={safeSync}
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
