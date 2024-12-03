import type {
  CreateWorkflowDto,
  SyncWorkflowDto,
  GeneratePreviewResponseDto,
  UpdateWorkflowDto,
  WorkflowResponseDto,
  WorkflowTestDataResponseDto,
  GeneratePreviewRequestDto,
  PatchWorkflowDto,
} from '@novu/shared';
import { delV2, getV2, patchV2, post, postV2, putV2 } from './api.client';

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
  return post<{ data: { transactionId?: string } }>(`/events/trigger`, {
    name,
    to,
    payload: { ...(payload ?? {}), __source: 'dashboard' },
  });
}

export async function createWorkflow(payload: CreateWorkflowDto) {
  return postV2<{ data: WorkflowResponseDto }>(`/workflows`, payload);
}

export async function syncWorkflow(workflowId: string, payload: SyncWorkflowDto) {
  return putV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowId}/sync`, payload);
}

export const updateWorkflow = async ({
  workflowId,
  workflow,
}: {
  workflowId: string;
  workflow: UpdateWorkflowDto;
}): Promise<WorkflowResponseDto> => {
  const { data } = await putV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowId}`, workflow);

  return data;
};

export const previewStep = async ({
  workflowSlug,
  data,
  stepSlug,
}: {
  workflowSlug: string;
  stepSlug: string;
  data?: GeneratePreviewRequestDto;
}): Promise<GeneratePreviewResponseDto> => {
  const res = await postV2<{ data: GeneratePreviewResponseDto }>(
    `/workflows/${workflowSlug}/step/${stepSlug}/preview`,
    data
  );

  return res.data;
};

export const deleteWorkflow = async ({ workflowId }: { workflowId: string }): Promise<void> => {
  return delV2(`/workflows/${workflowId}`);
};

export const patchWorkflow = async ({
  workflowId,
  workflow,
}: {
  workflowId: string;
  workflow: PatchWorkflowDto;
}): Promise<WorkflowResponseDto> => {
  const res = await patchV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowId}`, workflow);

  return res.data;
};
