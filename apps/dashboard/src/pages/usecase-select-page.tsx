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

export function UsecaseSelectPage() {
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [selectedUseCases, setSelectedUseCases] = useState<ChannelTypeEnum[]>([]);
  const [hoveredUseCase, setHoveredUseCase] = useState<ChannelTypeEnum | null>(null);

  const displayedUseCase = hoveredUseCase || (selectedUseCases.length > 0 ? selectedUseCases[0] : null);

  async function handleContinue() {
    setIsLoading(true);

    try {
      await updateClerkOrgMetadata({
        useCases: selectedUseCases,
      });

      navigate(ROUTES.WORKFLOWS);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageMeta title="Customize you experience" />

      <AuthCard>
        <div className="w-[564px] px-0">
          <div className="flex flex-col items-center gap-8">
            <UsecaseSelectOnboarding
              selectedUseCases={selectedUseCases}
              onHover={(id) => setHoveredUseCase(id)}
              onClick={(id) =>
                setSelectedUseCases((prev) =>
                  prev.includes(id) ? prev.filter((useCase) => useCase !== id) : [...prev, id]
                )
              }
            />

            <div className="flex flex-col items-center justify-center p-[60px] pt-0">
              <div className="flex w-[360px] flex-col items-center gap-8">
                <div className="flex w-full flex-col items-center gap-7">
                  <div className="flex w-full flex-col items-center gap-3">
                    <Button
                      disabled={selectedUseCases.length === 0 || loading}
                      className="w-full"
                      onClick={handleContinue}
                    >
                      Continue
                      {loading && <RiLoader2Line className="animate-spin" />}
                    </Button>
                    <Button
                      variant="link"
                      className="pt-0 text-xs text-[#717784]"
                      onClick={() => navigate(ROUTES.WORKFLOWS)}
                    >
                      Skip to Homepage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full w-full max-w-[564px] flex-1 justify-center border-l border-l-neutral-200">
          <AnimatePresence mode="wait">
            {displayedUseCase && (
              <motion.img
                key={displayedUseCase}
                src={`/images/auth/${displayedUseCase}-preview.svg`}
                alt={`${displayedUseCase}-usecase-illustration`}
                className="h-auto w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut',
                }}
              />
            )}

            {!displayedUseCase && (
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
                  This helps us understand your use-case better with the channels you'd use in your product to
                  communicate with your users.
                  <br />
                  <br />
                  don't worry, you can always change later as you build.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AuthCard>
    </>
  );
}
