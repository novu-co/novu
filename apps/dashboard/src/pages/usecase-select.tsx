import { UsecaseSelectOnboarding } from '../components/auth/usecase-selector';
import { AuthCard } from '../components/auth/auth-card';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function UsecaseSelectPage() {
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [hoveredUseCase, setHoveredUseCase] = useState<string | null>(null);

  return (
    <AuthCard>
      <div className="w-[564px] px-0">
        <div className="flex flex-col items-center gap-8">
          <UsecaseSelectOnboarding
            onHover={(id) => setHoveredUseCase(id)}
            onClick={(id) => setSelectedUseCases((prev) => [...prev, id])}
          />
        </div>
      </div>

      <div className="flex h-full w-full max-w-[564px] flex-1 justify-center border-l border-l-neutral-200">
        <AnimatePresence mode="wait">
          {hoveredUseCase && (
            <motion.img
              key={hoveredUseCase}
              src={`/images/auth/${hoveredUseCase}-preview.svg`}
              alt={`${hoveredUseCase}-usecase-illustration`}
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
