import type { WorkflowPreferencesPartial } from '@novu/shared';
import { ActionStepEnum, ChannelStepEnum } from '../constants';
import type { JsonSchema, Schema } from './schema.types';
import type { StepOptions } from './step.types';
import type { Execute } from './workflow.types';
import type { Awaitable, Prettify } from './util.types';
import type { EventTriggerParams, EventTriggerResult } from './event.types';
import type { WithPassthrough } from './provider.types';

export type StepType = `${ChannelStepEnum | ActionStepEnum}`;

export type DiscoverProviderOutput = {
  type: string;
  code: string;
  resolve: ({
    controls,
    outputs,
  }: {
    controls: Record<string, unknown>;
    outputs: Record<string, unknown>;
  }) => Awaitable<WithPassthrough<Record<string, unknown>>>;
  outputs: {
    schema: JsonSchema;
    unknownSchema: Schema;
  };
};

export type DiscoverStepOutput = {
  stepId: string;
  type: StepType;
  controls: {
    schema: JsonSchema;
    unknownSchema: Schema;
  };
  outputs: {
    schema: JsonSchema;
    unknownSchema: Schema;
  };
  results: {
    schema: JsonSchema;
    unknownSchema: Schema;
  };
  code: string;
  resolve: (controls: Record<string, unknown>) => Awaitable<Record<string, unknown>>;
  providers: Array<DiscoverProviderOutput>;
  options: StepOptions;
};

export type DiscoverWorkflowOutput = {
  workflowId: string;
  execute: Execute<Record<string, unknown>, Record<string, unknown>>;
  code: string;
  steps: Array<DiscoverStepOutput>;
  payload: {
    schema: JsonSchema;
    unknownSchema: Schema;
  };
  controls: {
    schema: JsonSchema;
    unknownSchema: Schema;
  };
  preferences: WorkflowPreferencesPartial;
  tags: string[];
  name?: string;
  description?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Workflow<T_Payload = any> = {
  trigger: (
    event: Prettify<Omit<EventTriggerParams<T_Payload>, 'workflowId' | 'bridgeUrl' | 'controls'>>
  ) => Promise<EventTriggerResult>;
  definition: DiscoverWorkflowOutput;
};

export type DiscoverOutput = {
  workflows: Array<DiscoverWorkflowOutput>;
};
