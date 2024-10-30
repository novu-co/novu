import { Workflow } from './discover.types';

export type InferWorkflowId<T_Workflow extends Workflow> = T_Workflow extends Workflow<infer Id, never> ? Id : never;

export type InferWorkflowPayload<
  T_Workflows extends Workflow[],
  T_WorkflowId extends InferWorkflowId<T_Workflows[number]>,
> = T_Workflows[number] extends infer T_Workflow
  ? T_Workflow extends Workflow<T_WorkflowId, infer Payload>
    ? Payload
    : never
  : never;
