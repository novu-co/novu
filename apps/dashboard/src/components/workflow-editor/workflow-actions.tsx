import { useFetchIntegrations } from '@/hooks/use-fetch-integrations';
import { ROUTES } from '@/utils/routes';
import { ChannelTypeEnum, StepTypeEnum, WorkflowResponseDto } from '@novu/shared';
import { RiArrowRightUpLine, RiInformationLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { Button } from '../primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
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
      <Popover>
        <PopoverTrigger asChild>
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
              <RiInformationLine className="text-foreground-400 h-4 w-4" />
              <RiArrowRightUpLine className="text-warning h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="max-w-[300px]">
          <p className="text-foreground-500 text-xs">
            You haven't yet integrated the inbox with your application, set it-up using our front-end component in less
            than 5 minutes
          </p>
        </PopoverContent>
      </Popover>
    </SidebarContent>
  );
}
