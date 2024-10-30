import type { StepResponseDto } from '@novu/shared';

export enum BaseEnvironmentEnum {
  DEVELOPMENT = 'Development',
  PRODUCTION = 'Production',
}

export type BridgeStatus = {
  status: 'ok';
  bridgeUrl?: string;
  discovered: {
    workflows: number;
  };
};

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  LOADING = 'loading',
}

export enum WorkflowIssueTypeEnum {
  MISSING_VARIABLE_IN_PAYLOAD = 'MISSING_VARIABLE_IN_PAYLOAD',
  VARIABLE_TYPE_MISMATCH = 'VARIABLE_TYPE_MISMATCH',
  MISSING_VALUE = 'MISSING_VALUE',
  WORKFLOW_ID_ALREADY_EXIST = 'WORKFLOW_ID_ALREADY_EXIST',
  STEP_ID_ALREADY_EXIST = 'STEP_ID_ALREADY_EXIST',
}

export type RuntimeIssue = {
  issueType: WorkflowIssueTypeEnum;
  variableName?: string;
  message: string;
};

// TODO: update this when the API types are updated
export type Step = Pick<StepResponseDto, 'name' | 'type' | '_id' | 'stepId'> & {
  issues?: {
    body: Record<string, RuntimeIssue[]>;
    control: Record<string, RuntimeIssue[]>;
  };
};
