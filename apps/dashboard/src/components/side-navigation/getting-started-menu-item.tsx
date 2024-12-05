import { useUser } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { RiQuestionLine, RiSparkling2Fill, RiCloseLine } from 'react-icons/ri';
import { Badge } from '../primitives/badge';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useEnvironment } from '@/context/environment/hooks';
import { useOnboardingSteps } from '../../hooks/use-onboarding-steps';
import { NavigationLink } from './navigation-link';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { Button } from '../primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FeatureFlagsKeysEnum } from '@novu/shared';

export function GettingStartedMenuItem() {
  const { totalSteps, completedSteps, steps } = useOnboardingSteps();
  const isGettingStartedEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_GETTING_STARTED_ENABLED);

  const { currentEnvironment } = useEnvironment();
  const { user } = useUser();
  const track = useTelemetry();

  const allStepsCompleted = completedSteps === totalSteps;

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    track(TelemetryEvent.WELCOME_MENU_HIDDEN, {
      completedSteps: steps.filter((step) => step.status === 'completed').map((step) => step.id),
      totalSteps,
      allStepsCompleted,
    });

    await user?.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        hideGettingStarted: true,
      },
    });
  };

  if (!isGettingStartedEnabled || user?.unsafeMetadata?.hideGettingStarted) {
    return null;
  }

  return (
    <motion.div className="contents" whileHover="hover" initial="initial">
      <NavigationLink to={buildRoute(ROUTES.WELCOME, { environmentSlug: currentEnvironment?.slug ?? '' })}>
        <RiQuestionLine className="size-4" />
        <span>Getting started</span>

        <Badge
          variant="soft"
          kind="pill"
          className="bg-primary/10 text-primary inline-flex items-center gap-0.5 px-1 py-0.5 leading-4"
        >
          <motion.div
            variants={{
              initial: { scale: 1, rotate: 0, opacity: 1 },
              hover: {
                scale: [1, 1.1, 1],
                rotate: [0, 4, -4, 0],
                opacity: [0, 1, 1],
                transition: {
                  duration: 1.4,
                  repeat: 0,
                  ease: 'easeInOut',
                },
              },
            }}
          >
            <RiSparkling2Fill className="h-4 w-4" />
          </motion.div>
          <span className="text-xs">
            {completedSteps}/{totalSteps}
          </span>
        </Badge>

        {allStepsCompleted && (
          <motion.div
            className="ml-auto h-4 w-4"
            variants={{
              initial: { opacity: 0 },
              hover: { opacity: 1 },
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClose}
                  className="h-4 w-4 hover:bg-neutral-300"
                  aria-label="Close getting started menu"
                >
                  <RiCloseLine className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>This will hide the Getting Started page</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </NavigationLink>
    </motion.div>
  );
}
