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

// TODO: update this when the API types are updated
export type Step = Pick<StepResponseDto, 'name' | 'type' | '_id'>;
