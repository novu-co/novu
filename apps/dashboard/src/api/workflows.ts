import type { CreateWorkflowDto, PromoteWorkflowDto, UpdateWorkflowDto, WorkflowResponseDto } from '@novu/shared';
import { getV2, postV2, putV2 } from './api.client';

export const fetchWorkflow = async ({ workflowId }: { workflowId?: string }): Promise<WorkflowResponseDto> => {
  const { data } = await getV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowId}`);

  return data;
};

export async function createWorkflow(payload: CreateWorkflowDto) {
  return postV2<{ data: WorkflowResponseDto }>(`/workflows`, payload);
}

export async function promoteWorkflow(workflowId: string, payload: PromoteWorkflowDto) {
  return putV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowId}/promote`, payload);
}

export const updateWorkflow = async ({
  id,
  workflow,
}: {
  id: string;
  workflow: UpdateWorkflowDto;
}): Promise<WorkflowResponseDto> => {
  const { data } = await putV2<{ data: WorkflowResponseDto }>(`/workflows/${id}`, workflow);

  return data;
};
