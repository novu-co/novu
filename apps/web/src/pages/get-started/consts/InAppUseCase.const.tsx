import { useTheme } from '@emotion/react';
import { ChannelTypeEnum } from '@novu/shared';
import { ROUTES } from '@novu/shared-web';
import { useGetIntegrationsByChannel } from '../../integrations/useGetIntegrationsByChannel';
import { GetStartedAnimationContainer } from '../components/GetStartedAnimationContainer';
import { Link, StepDescription, StepText } from './shared';
import { OnboardingUseCase } from './types';
import { CreateWorkflowButton } from '../components/CreateWorkflowButton';

const USECASE_BLUEPRINT_IDENTIFIER = 'get-started-in-app';

export const InAppUseCaseConst: OnboardingUseCase = {
  title: 'In-app notifications center',
  description:
    "Utilize Novu's pre-built customizable in-app component. " +
    'Or opt for the headless library to create your own in-app notification center.',
  steps: [
    {
      title: 'Configure In-App provider',
      Description: function () {
        const { integrations } = useGetIntegrationsByChannel({ channelType: ChannelTypeEnum.IN_APP });

        const getInAppIntegrationUrl = () => {
          const inAppIntegration = integrations?.[0];
          if (!inAppIntegration) {
            alert('Loading!');

            return ROUTES.INTEGRATIONS;
          }

          return `${ROUTES.INTEGRATIONS}/${inAppIntegration._id}`;
        };

        return (
          <StepDescription>
            <Link href={getInAppIntegrationUrl()}>Create In-app provider</Link>
            <StepText>
              {' instance, and select a framework to set up credentials in the Novu’s Integration store.'}
            </StepText>
          </StepDescription>
        );
      },
    },
    {
      title: 'Build a workflow',
      Description: function () {
        return (
          <StepDescription>
            <StepText>Novu pre-built a workflow for testing.</StepText>
            <CreateWorkflowButton children={' Customize '} blueprintIdentifier={USECASE_BLUEPRINT_IDENTIFIER} />
            <StepText>it or create a new one on the Workflows page. </StepText>
          </StepDescription>
        );
      },
    },
    {
      title: 'Connect trigger and run test',
      Description: function () {
        return (
          <StepDescription>
            <Link children={'Test the trigger'} href={'https://mantine.dev/core/timeline/'} />
            <StepText>
              {' as if you sent it from your API. Add a subscriber by sending data to the trigger method.'}
            </StepText>
          </StepDescription>
        );
      },
    },
    {
      title: 'Track activity feed',
      Description: function () {
        return (
          <StepDescription>
            <StepText>Discover</StepText>
            <Link href={ROUTES.ACTIVITIES}> activity feed </Link>
            <StepText>
              to monitor notifications activity and see potential issues with a specific provider or channel.
            </StepText>
          </StepDescription>
        );
      },
    },
  ],
  Demo: () => <GetStartedAnimationContainer assetDark={'Dark Placeholder'} assetLight={'Light Placeholder'} />,
};
