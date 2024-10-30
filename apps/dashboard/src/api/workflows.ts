import type {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowResponseDto,
  WorkflowTestDataResponseDto,
} from '@novu/shared';
import { getV2, post, postV2, putV2 } from './api.client';

export const fetchWorkflow = async ({ workflowSlug }: { workflowSlug?: string }): Promise<WorkflowResponseDto> => {
  const { data } = await getV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowSlug}`);

  return data;
};

export const fetchWorkflowTestData = async ({
  workflowSlug,
}: {
  workflowSlug?: string;
}): Promise<WorkflowTestDataResponseDto> => {
  const { data } = await getV2<{ data: WorkflowTestDataResponseDto }>(`/workflows/${workflowSlug}/test-data`);

  return data;
};

export async function triggerWorkflow({ name, payload, to }: { name: string; payload: unknown; to: unknown }) {
  return post<{ data: { transactionId: string } }>(`/events/trigger`, {
    name,
    to,
    payload: { ...(payload ?? {}), __source: 'dashboard' },
  });
}

export async function createWorkflow(payload: CreateWorkflowDto) {
  return postV2<{ data: WorkflowResponseDto }>(`/workflows`, payload);
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
