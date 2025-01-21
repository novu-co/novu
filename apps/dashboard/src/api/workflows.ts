import type {
  CreateWorkflowDto,
  IEnvironment,
  ListWorkflowResponse,
  PatchWorkflowDto,
  SyncWorkflowDto,
  UpdateWorkflowDto,
  WorkflowResponseDto,
  WorkflowTestDataResponseDto,
} from '@novu/shared';
import { delV2, getV2, patchV2, post, postV2, putV2 } from './api.client';
import { IWorkflowSuggestion } from '../components/template-store/templates';

export const getWorkflow = async ({
  environment,
  workflowSlug,
}: {
  environment: IEnvironment;
  workflowSlug?: string;
}): Promise<WorkflowResponseDto> => {
  const { data } = await getV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowSlug}`, { environment });

  return data;
};

export const getWorkflows = async ({
  environment,
  limit,
  query,
  offset,
}: {
  environment: IEnvironment;
  limit: number;
  offset: number;
  query: string;
}): Promise<ListWorkflowResponse> => {
  const { data } = await getV2<{ data: ListWorkflowResponse }>(
    `/workflows?limit=${limit}&offset=${offset}&query=${query}`,
    { environment }
  );
  return data;
};

export const getWorkflowTestData = async ({
  environment,
  workflowSlug,
}: {
  environment: IEnvironment;
  workflowSlug?: string;
}): Promise<WorkflowTestDataResponseDto> => {
  const { data } = await getV2<{ data: WorkflowTestDataResponseDto }>(`/workflows/${workflowSlug}/test-data`, {
    environment,
  });

  return data;
};

export async function triggerWorkflow({
  environment,
  name,
  payload,
  to,
}: {
  environment: IEnvironment;
  name: string;
  payload: unknown;
  to: unknown;
}) {
  return post<{ data: { transactionId?: string } }>(`/events/trigger`, {
    environment,
    body: {
      name,
      to,
      payload: { ...(payload ?? {}), __source: 'dashboard' },
    },
  });
}

export async function createWorkflow({
  environment,
  workflow,
}: {
  environment: IEnvironment;
  workflow: CreateWorkflowDto;
}) {
  return postV2<{ data: WorkflowResponseDto }>(`/workflows`, { environment, body: workflow });
}

export async function syncWorkflow({
  environment,
  workflowSlug,
  payload,
}: {
  environment: IEnvironment;
  workflowSlug: string;
  payload: SyncWorkflowDto;
}) {
  return putV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowSlug}/sync`, { environment, body: payload });
}

export const updateWorkflow = async ({
  environment,
  workflow,
  workflowSlug,
}: {
  environment: IEnvironment;
  workflow: UpdateWorkflowDto;
  workflowSlug: string;
}): Promise<WorkflowResponseDto> => {
  const { data } = await putV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowSlug}`, {
    environment,
    body: workflow,
  });

  return data;
};

export const deleteWorkflow = async ({
  environment,
  workflowSlug,
}: {
  environment: IEnvironment;
  workflowSlug: string;
}): Promise<void> => {
  return delV2(`/workflows/${workflowSlug}`, { environment });
};

export const patchWorkflow = async ({
  environment,
  workflow,
  workflowSlug,
}: {
  environment: IEnvironment;
  workflow: PatchWorkflowDto;
  workflowSlug: string;
}): Promise<WorkflowResponseDto> => {
  const res = await patchV2<{ data: WorkflowResponseDto }>(`/workflows/${workflowSlug}`, {
    environment,
    body: workflow,
  });

  return res.data;
};

export const generateWorkflowSuggestions = async ({
  environment,
  prompt,
  mode,
}: {
  environment: IEnvironment;
  prompt: string;
  mode: 'single' | 'multiple';
}) => {
  const { data } = await postV2<{ data: { suggestions: IWorkflowSuggestion[] } }>('/workflows/suggestions', {
    environment,
    body: { prompt, mode },
  });

  return data.suggestions;
};
