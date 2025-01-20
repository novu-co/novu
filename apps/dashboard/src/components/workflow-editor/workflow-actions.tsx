import { useFetchIntegrations } from '@/hooks/use-fetch-integrations';
import { ROUTES } from '@/utils/routes';
import { ChannelTypeEnum, StepTypeEnum, WorkflowResponseDto } from '@novu/shared';
import { RiArrowRightUpLine, RiTimeLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { Button } from '../primitives/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../primitives/hover-card';
import { StatusBadge, StatusBadgeIcon } from '../primitives/status-badge';
import { SidebarContent } from '../side-navigation/sidebar';
import TruncatedText from '../truncated-text';

interface WorkflowActionsProps {
  workflow: WorkflowResponseDto;
}

export function WorkflowActions({ workflow }: WorkflowActionsProps) {
  const { integrations } = useFetchIntegrations();
  const navigate = useNavigate();

  const hasInAppStep = workflow.steps.some((step) => step.type === StepTypeEnum.IN_APP);
  const hasConnectedInAppIntegration = integrations?.some(
    (integration) => integration.channel === ChannelTypeEnum.IN_APP && integration.connected
  );

  const showInAppActionRequired = hasInAppStep && !hasConnectedInAppIntegration;

  const handleInboxSetup = () => {
    navigate(ROUTES.INBOX_EMBED);
  };

  if (!showInAppActionRequired) {
    return null;
  }

  return (
    <SidebarContent>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Action required</span>
      </div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            mode="outline"
            className="flex w-full justify-start gap-1.5 text-xs font-medium"
            type="button"
            onClick={handleInboxSetup}
          >
            <span className="bg-warning h-4 min-w-1 rounded-full" />
            <TruncatedText>Connect Inbox to your application</TruncatedText>
            <div className="ml-auto flex items-center gap-1">
              <RiArrowRightUpLine className="text-warning h-4 w-4" />
            </div>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent side="left" align="center" className="w-80">
          <div className="flex flex-col gap-3">
            <div className="text-subheading-xs flex items-center gap-2">Inbox Integration Required</div>
            <p className="text-foreground-500 text-xs">
              You haven't yet integrated the Inbox component with your application
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge variant="stroke" status="pending">
                <StatusBadgeIcon as={RiTimeLine} />
                Less than 4 minutes setup
              </StatusBadge>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </SidebarContent>
  );
}
