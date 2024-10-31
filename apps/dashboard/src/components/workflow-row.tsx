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
import { usePromoteWorkflow } from '@/hooks/use-promote-workflow2';

type WorkflowRowProps = {
  workflow: WorkflowListResponseDto;
};

export const WorkflowRow = ({ workflow }: WorkflowRowProps) => {
  const { currentEnvironment } = useEnvironment();
  const { safePromote, isPromotable, tooltipContent, ConfirmationModal } = usePromoteWorkflow(workflow);

  const isV1Workflow = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1;
  const workflowLink = isV1Workflow
    ? buildRoute(LEGACY_ROUTES.EDIT_WORKFLOW, { workflowId: workflow._id })
    : buildRoute(ROUTES.EDIT_WORKFLOW, {
        environmentId: currentEnvironment?._id ?? '',
        workflowId: workflow._id,
      });

  return (
    <TableRow key={workflow._id} className="relative">
      <ConfirmationModal />
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
                onPromote={safePromote}
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
