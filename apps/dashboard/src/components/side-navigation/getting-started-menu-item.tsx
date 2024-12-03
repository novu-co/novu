import { motion } from 'motion/react';
import { RiQuestionLine, RiSparkling2Fill } from 'react-icons/ri';
import { Badge } from '../primitives/badge';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useEnvironment } from '@/context/environment/hooks';
import { useOnboardingSteps } from '../../hooks/use-onboarding-steps';
import { NavigationLink } from './navigation-link';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FeatureFlagsKeysEnum } from '@novu/shared';

export function GettingStartedMenuItem() {
  const { totalSteps, completedSteps } = useOnboardingSteps();
  const { currentEnvironment } = useEnvironment();
  const isGettingStartedEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_GETTING_STARTED_ENABLED);

  if (!isGettingStartedEnabled) {
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
      </NavigationLink>
    </motion.div>
  );
}
