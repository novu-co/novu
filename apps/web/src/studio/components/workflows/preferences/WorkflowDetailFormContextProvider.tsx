import { type WorkflowPreferences } from '@novu/shared';
import { type FC, type PropsWithChildren } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { type WorkflowGeneralSettings } from './types';

interface IWorkflowDetailFormContextProviderProps {}

export type WorkflowDetailFormContext = {
  general: WorkflowGeneralSettings;
  preferences: WorkflowPreferences | null;
};

export const WorkflowDetailFormContextProvider: FC<PropsWithChildren<IWorkflowDetailFormContextProviderProps>> = ({
  children,
}) => {
  const formValues = useForm<WorkflowDetailFormContext>({
    mode: 'onChange',
  });

  return <FormProvider {...formValues}>{children}</FormProvider>;
};
