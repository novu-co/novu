import { PatchWorkflowDto, UpdateWorkflowDto, WorkflowResponseDto } from '@novu/shared';
import { createContext, ReactNode, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchWorkflow, useUpdateWorkflow } from '@/hooks';
import { useDebounce } from '@/hooks/use-debounce';
import { usePatchWorkflow } from '@/hooks/use-patch-workflow';
import { createContextHook } from '@/utils/context';
import { buildRoute, ROUTES } from '@/utils/routes';

export type WorkflowContextType = {
  isPending: boolean;
  workflow?: WorkflowResponseDto;
  update: (data: UpdateWorkflowDto) => void;
  debouncedUpdate: (data: UpdateWorkflowDto) => void;
  patch: (data: PatchWorkflowDto) => void;
};

export const WorkflowContext = createContext<WorkflowContextType>({} as WorkflowContextType);

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '' } = useParams<{ workflowSlug?: string; stepSlug?: string }>();
  const [toastId, setToastId] = useState<string | number>('');
  const navigate = useNavigate();

  const { workflow, isPending, error } = useFetchWorkflow({
    workflowSlug,
  });

  const { patchWorkflow } = usePatchWorkflow({
    //TODO: Make these toasts more DRY
    onMutate: () => {
      setToastId(
        showToast({
          children: () => (
            <>
              <ToastIcon variant={'default'} />
              <span className="text-sm">Saving</span>
            </>
          ),
          options: {
            position: 'bottom-left',
            classNames: {
              toast: 'ml-10',
            },
          },
        })
      );
    },
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-left',
          classNames: {
            toast: 'ml-10',
          },
          id: toastId,
        },
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to save</span>
          </>
        ),
        options: {
          position: 'bottom-left',
          classNames: {
            toast: 'ml-10',
          },
        },
      });
    },
  });

  const { updateWorkflow } = useUpdateWorkflow({
    onMutate: () => {
      setToastId(
        showToast({
          children: () => (
            <>
              <ToastIcon variant={'default'} />
              <span className="text-sm">Saving</span>
            </>
          ),
          options: {
            position: 'bottom-left',
            classNames: {
              toast: 'ml-10',
            },
          },
        })
      );
    },
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-left',
          classNames: {
            toast: 'ml-10',
          },
          id: toastId,
        },
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to save</span>
          </>
        ),
        options: {
          position: 'bottom-left',
          classNames: {
            toast: 'ml-10',
          },
        },
      });
    },
  });

  const debounce = useDebounce(updateWorkflow, 500);
  const debouncedUpdate = (data: UpdateWorkflowDto) => {
    if (workflow) {
      debounce({ id: workflow.workflowId, workflow: data });
    }
  };
  const update = (data: UpdateWorkflowDto) => {
    if (workflow) {
      debouncedUpdate(data);
      debounce.flush();
    }
  };
  const patch = (data: PatchWorkflowDto) => {
    if (workflow) {
      patchWorkflow({ workflow: data, workflowId: workflow.workflowId });
    }
  };

  useLayoutEffect(() => {
    if (error) {
      navigate(buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment?.slug ?? '' }));
    }

    if (!workflow) {
      return;
    }
  }, [workflow, error, navigate, currentEnvironment]);

  return (
    <WorkflowContext.Provider value={{ debouncedUpdate, update, patch, isPending, workflow }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = createContextHook(WorkflowContext);
