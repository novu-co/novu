import { UsecaseSelectOnboarding } from '../components/auth/usecase-selector';
import { AuthCard } from '../components/auth/auth-card';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/primitives/button';
import { ROUTES } from '../utils/routes';
import { useNavigate } from 'react-router-dom';
import { OnboardingArrowLeft } from '../components/icons/onboarding-arrow-left';
import { updateClerkOrgMetadata } from '../api/organization';
import { ChannelTypeEnum } from '@novu/shared';
import { RiLoader2Line } from 'react-icons/ri';
import { PageMeta } from '../components/page-meta';
import { useTelemetry } from '../hooks';
import { TelemetryEvent } from '../utils/telemetry';
import { channelOptions } from '../components/auth/usecases-list.utils';
import { useMutation } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';

export function UsecaseSelectPage() {
  const navigate = useNavigate();
  const track = useTelemetry();
  const [selectedUseCases, setSelectedUseCases] = useState<ChannelTypeEnum[]>([]);
  const [hoveredUseCase, setHoveredUseCase] = useState<ChannelTypeEnum | null>(null);

  const displayedUseCase =
    hoveredUseCase || (selectedUseCases.length > 0 ? selectedUseCases[selectedUseCases.length - 1] : null);

  const { mutate: handleContinue, isPending } = useMutation({
    mutationFn: async () => {
      await updateClerkOrgMetadata({
        useCases: selectedUseCases,
      });
    },
    onSuccess: () => {
      track(TelemetryEvent.USE_CASE_SELECTED, {
        useCases: selectedUseCases,
      });
      navigate(ROUTES.WORKFLOWS);
    },
    onError: (error) => {
      console.error('Failed to update use cases:', error);
      Sentry.captureException(error);
    },
  });

  function handleSkip() {
    track(TelemetryEvent.USE_CASE_SKIPPED);

    navigate(ROUTES.WORKFLOWS);
  }

  function handleSelectUseCase(useCase: ChannelTypeEnum) {
    setSelectedUseCases((prev) =>
      prev.includes(useCase) ? prev.filter((item) => item !== useCase) : [...prev, useCase]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (selectedUseCases.length === 0 || isPending) return;

    handleContinue();
  }

  return (
    <>
      <PageMeta title="Customize you experience" />

      <AuthCard>
        <div className="flex w-[480px] justify-center px-0">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex max-w-[480px] flex-col items-center justify-center gap-8 p-[60px]">
              <UsecaseSelectOnboarding
                channelOptions={channelOptions}
                selectedUseCases={selectedUseCases}
                onHover={(id) => setHoveredUseCase(id)}
                onClick={(id) => handleSelectUseCase(id)}
              />

              <div className="flex w-full flex-col items-center gap-3">
                <Button disabled={selectedUseCases.length === 0 || isPending} className="w-full" type="submit">
                  Continue
                  {isPending && <RiLoader2Line className="animate-spin" />}
                </Button>
                <Button type="button" variant="link" className="pt-0 text-xs text-[#717784]" onClick={handleSkip}>
                  Skip to Homepage
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex h-full w-full max-w-[640px] flex-1 items-center justify-center border-l border-l-neutral-200 px-10">
          <AnimatePresence mode="wait">
            {displayedUseCase && (
              <motion.img
                key={displayedUseCase}
                src={`/images/auth/${channelOptions.find((option) => option.id === displayedUseCase)?.image}`}
                alt={`${displayedUseCase}-usecase-illustration`}
                className="h-auto max-h-[500px] w-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut',
                }}
              />
            )}

            {!displayedUseCase && <EmptyStateView />}
          </AnimatePresence>
        </div>
      </AuthCard>
    </>
  );
}

function EmptyStateView() {
  return (
    <motion.div
      className="relative w-full p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
    >
      <div className="absolute left-2 top-[175px]">
        <OnboardingArrowLeft className="text-success h-[25px] w-[65px]" />
      </div>

      {/* Instruction Text */}
      <p className="text-success absolute left-10 top-[211px] text-xs italic">
        Hover on the cards to visualize, <br />
        select all that apply.
      </p>

      {/* Help Text */}
      <p className="absolute bottom-4 left-3.5 w-[400px] text-xs italic text-neutral-400">
        This helps us understand your use-case better with the channels you'd use in your product to communicate with
        your users.
        <br />
        <br />
        don't worry, you can always change later as you build.
      </p>
    </motion.div>
  );
}
