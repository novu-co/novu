import { createContext } from 'react';
import { type StepDataDto, StepTypeEnum } from '@novu/shared';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';

export type StepEditorContextType = {
  isPendingStep: boolean;
  isRefetchingStep: boolean;
  step?: StepDataDto;
  stepType?: StepTypeEnum;
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<StepDataDto, Error>>;
};

export const StepEditorContext = createContext<StepEditorContextType>({} as StepEditorContextType);
