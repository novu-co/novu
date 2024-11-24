import { UsecaseSelectOnboarding } from '../components/auth/usecase-selector';
import { AuthCard } from '../components/auth/auth-card';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/primitives/button';

export function UsecaseSelectPage() {
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [hoveredUseCase, setHoveredUseCase] = useState<string | null>(null);

  const displayedUseCase = hoveredUseCase || (selectedUseCases.length > 0 ? selectedUseCases[0] : null);

  return (
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

          <div className="flex w-full flex-col items-center gap-7">
            <div className="flex w-full flex-col items-center gap-3">
              <Button className="w-full cursor-not-allowed bg-[#F4F5F6] text-[#CAD0D8] hover:bg-[#F4F5F6]" disabled>
                Continue
              </Button>
              <button className="text-xs text-[#717784]">Skip to Homepage</button>
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
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
