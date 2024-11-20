import { Button } from '@/components/primitives/button';
import { CardDescription, CardTitle } from '@/components/primitives/card';
import React, { useState } from 'react';
import { StepIndicator } from '@/components/auth/shared';
import { useForm, Controller } from 'react-hook-form';
import { updateClerkOrgMetadata } from '../api/organization';
import { useTelemetry } from '../hooks';
import { TelemetryEvent } from '../utils/telemetry';

interface UseCaseOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const USE_CASES: UseCaseOption[] = [
  {
    id: 'user-notifications',
    title: 'User Notifications',
    description: 'Send notifications to your users about updates, alerts, and activities',
    icon: '🔔',
  },
  {
    id: 'marketing-communications',
    title: 'Marketing Communications',
    description: 'Engage users with promotional content and campaign updates',
    icon: '📢',
  },
  {
    id: 'system-alerts',
    title: 'System Alerts',
    description: 'Monitor and notify about system status and critical events',
    icon: '⚡',
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    description: 'Automate communication in your business processes',
    icon: '⚙️',
  },
];

interface UseCaseFormData {
  selectedUseCases: string[];
}

export function UsecaseSelectPage() {
  const { control, handleSubmit, watch } = useForm<UseCaseFormData>({
    defaultValues: {
      selectedUseCases: [],
    },
  });
  const track = useTelemetry();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedUseCases = watch('selectedUseCases');
  const isFormValid = selectedUseCases.length > 0;

  const onSubmit = async (data: UseCaseFormData) => {
    setIsSubmitting(true);

    try {
      await updateClerkOrgMetadata({
        // useCases: data.selectedUseCases,
      });

      track(TelemetryEvent.USE_CASE_SELECTED, {
        useCases: data.selectedUseCases,
      });

      // Navigate to the next page or dashboard
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-[564px] px-0 py-[60px]">
        <div className="flex flex-col items-center gap-8">
          <div className="flex w-[350px] flex-col gap-1">
            <div className="flex w-full items-center gap-1.5">
              <div className="flex flex-1 flex-col gap-1">
                <StepIndicator step={3} />
                <CardTitle className="text-lg font-medium text-[#232529]">What would you like to build?</CardTitle>
              </div>
            </div>
            <CardDescription className="text-xs text-[#99A0AE]">
              Select the use cases that best match your needs. You can select multiple options.
            </CardDescription>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex w-[350px] flex-col gap-8">
            <Controller
              name="selectedUseCases"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-3">
                  {USE_CASES.map((useCase) => (
                    <Button
                      key={useCase.id}
                      type="button"
                      variant="outline"
                      className={`flex h-auto flex-col items-start gap-1 p-4 text-left ${
                        field.value.includes(useCase.id) ? 'border-primary bg-primary/5' : 'border-[#E1E4EA]'
                      }`}
                      onClick={() => {
                        const newValue = field.value.includes(useCase.id)
                          ? field.value.filter((id) => id !== useCase.id)
                          : [...field.value, useCase.id];
                        field.onChange(newValue);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{useCase.icon}</span>
                        <span className="font-medium">{useCase.title}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">{useCase.description}</span>
                    </Button>
                  ))}
                </div>
              )}
            />

            {isFormValid && (
              <div className="flex flex-col gap-3">
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="w-full max-w-[564px] flex-1">
        <img src="/images/auth/ui-usecase.svg" alt="select-usecase-illustration" />
      </div>
    </>
  );
}
