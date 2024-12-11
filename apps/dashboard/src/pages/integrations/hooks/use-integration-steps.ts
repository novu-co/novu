import { useState, useEffect } from 'react';
import { IntegrationStep } from '../types';

interface UseIntegrationStepsProps {
  isOpened: boolean;
}

export function useIntegrationSteps({ isOpened }: UseIntegrationStepsProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string>();
  const [step, setStep] = useState<IntegrationStep>('select');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpened) {
      setSelectedIntegration(undefined);
      setStep('select');
      setSearchQuery('');
    }
  }, [isOpened]);

  const onIntegrationSelect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setStep('configure');
  };

  const onBack = () => {
    setStep('select');
    setSelectedIntegration(undefined);
  };

  return {
    selectedIntegration,
    step,
    searchQuery,
    setSearchQuery,
    onIntegrationSelect,
    onBack,
  };
}
