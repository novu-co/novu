import { useMemo } from 'react';
import { useWorkflows } from './use-workflows';
import { useOrganization } from '@clerk/clerk-react';
import { ChannelTypeEnum } from '@novu/shared';
import { useIntegrations } from './use-integrations';

export enum StepIdEnum {
  ACCOUNT_CREATION = 'account-creation',
  CREATE_A_WORKFLOW = 'create-a-workflow',
  INVITE_TEAM_MEMBER = 'invite-team-member',
  SYNC_TO_PRODUCTION = 'sync-to-production',
  CONNECT_EMAIL_PROVIDER = 'connect-email-provider',
  CONNECT_IN_APP_PROVIDER = 'connect-in-app-provider',
  CONNECT_PUSH_PROVIDER = 'connect-push-provider',
  CONNECT_CHAT_PROVIDER = 'connect-chat-provider',
  CONNECT_SMS_PROVIDER = 'connect-sms-provider',
}

export interface Step {
  id: StepIdEnum;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export function useOnboardingSteps() {
  const { data: workflows } = useWorkflows();
  const { organization } = useOrganization();
  const { integrations } = useIntegrations();

  const hasInvitedTeamMember = useMemo(() => {
    return organization?.membersCount && organization.membersCount > 1;
  }, [organization?.membersCount]);

  const providerType = useMemo(() => {
    const metadata = organization?.publicMetadata as Record<string, unknown>;
    const useCases = (metadata?.useCases as ChannelTypeEnum[]) || ['in-app'];

    if (useCases.includes(ChannelTypeEnum.IN_APP)) return ChannelTypeEnum.IN_APP;
    if (useCases.includes(ChannelTypeEnum.EMAIL)) return ChannelTypeEnum.EMAIL;

    return useCases[0];
  }, [organization?.publicMetadata]);

  const steps = useMemo(
    () => [
      {
        id: StepIdEnum.ACCOUNT_CREATION,
        title: 'Account creation',
        description: "We know it's not always easy — take a moment to celebrate!",
        status: 'completed',
      },
      {
        id: StepIdEnum.CREATE_A_WORKFLOW,
        title: 'Create a workflow',
        description: 'Workflows in Novu, orchestrate notifications across channels.',
        status: workflows && workflows.totalCount > 0 ? 'completed' : 'in-progress',
      },
      {
        id: `connect-${providerType}-provider` as StepIdEnum,
        title:
          providerType === ChannelTypeEnum.IN_APP
            ? 'Add an Inbox to your app'
            : `Connect your ${providerType} provider`,
        description: `Connect your provider to send ${providerType} notifications with Novu.`,
        status: integrations?.some(
          (integration) => integration.channel === providerType && !integration.providerId.startsWith('novu-')
        )
          ? 'completed'
          : 'pending',
      },
      {
        id: StepIdEnum.INVITE_TEAM_MEMBER,
        title: 'Invite a team member?',
        description: 'Need help from a team member, let them know',
        status: hasInvitedTeamMember ? 'completed' : 'pending',
      },
    ],
    [workflows, hasInvitedTeamMember, providerType, integrations]
  );

  return { steps, providerType };
}
