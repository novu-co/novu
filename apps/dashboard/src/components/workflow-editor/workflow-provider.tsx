import { PatchWorkflowDto, UpdateWorkflowDto, WorkflowResponseDto } from '@novu/shared';
import { createContext, ReactNode, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';

import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchWorkflow, useUpdateWorkflow } from '@/hooks';
import { useDebounce } from '@/hooks/use-debounce';
import { usePatchWorkflow } from '@/hooks/use-patch-workflow';
import { createContextHook } from '@/utils/context';
import { buildRoute, ROUTES } from '@/utils/routes';
import { toast } from 'sonner';
import { RiCloseFill } from 'react-icons/ri';
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/primitives/alert-dialog';
import { RiAlertFill } from 'react-icons/ri';
import { CheckCircleIcon } from 'lucide-react';

export type WorkflowContextType = {
  isPending: boolean;
  workflow?: WorkflowResponseDto;
  update: (data: UpdateWorkflowDto) => void;
  debouncedUpdate: (data: UpdateWorkflowDto) => void;
  patch: (data: PatchWorkflowDto) => void;
  onDirtyChange: (isDirty: boolean) => void;
};

export const WorkflowContext = createContext<WorkflowContextType>({} as WorkflowContextType);

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '' } = useParams<{ workflowSlug?: string; stepSlug?: string }>();
  const [toastId, setToastId] = useState<string | number>('');
  const [isFormDirty, setIsFormDirty] = useState(false);
  const navigate = useNavigate();

  const { workflow, isPending, error } = useFetchWorkflow({
    workflowSlug,
  });

  const { patchWorkflow, isPending: isPatchPending } = usePatchWorkflow({
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
    onSuccess: async () => {
      setIsFormDirty(false);

      if (blocker.state === 'blocked') {
        // user is leaving the editor, proceed with the pending navigation
        await handleBlockedNavigation();
        return;
      }

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

  const { updateWorkflow, isPending: isUpdatePending } = useUpdateWorkflow({
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
    onSuccess: async () => {
      setIsFormDirty(false);

      if (blocker.state === 'blocked') {
        // user is leaving the editor, proceed with the pending navigation
        await handleBlockedNavigation();
        return;
      }

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

  const isUpdatePatchPending = useMemo(
    () => isPatchPending || isUpdatePending || isFormDirty,
    [isPatchPending, isUpdatePending, isFormDirty]
  );

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

  const blocker = useBlocker(({ nextLocation }) => {
    const workflowEditorBasePath = buildRoute(ROUTES.EDIT_WORKFLOW, {
      workflowSlug,
      environmentSlug: currentEnvironment?.slug ?? '',
    });

    const isLeavingEditor = !nextLocation.pathname.startsWith(workflowEditorBasePath);

    return isLeavingEditor && isUpdatePatchPending;
  });

  /*
   * If there was a pending navigation when saving was in progress,
   * proceed with that navigation now that changes are saved
   *
   * small timeout to briefly show the success dialog before navigating
   */
  const handleBlockedNavigation = useCallback(async () => {
    toast.dismiss();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        blocker.proceed?.();
        resolve();
      }, 500);
    });
  }, [blocker]);

  const handleCancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return (
    <>
      <SavingChangesDialog
        isOpen={blocker.state === 'blocked'}
        isUpdatePatchPending={isUpdatePatchPending}
        onCancel={handleCancelNavigation}
      />
      <WorkflowContext.Provider
        value={{ debouncedUpdate, update, patch, isPending, workflow, onDirtyChange: setIsFormDirty }}
      >
        {children}
      </WorkflowContext.Provider>
    </>
  );
};

const SavingChangesDialog = ({
  isOpen,
  isUpdatePatchPending,
  onCancel,
}: {
  isOpen: boolean;
  isUpdatePatchPending: boolean;
  onCancel: () => void;
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="w-[26rem]">
        <AlertDialogHeader className="flex flex-row items-start gap-4">
          <div
            className={`rounded-lg p-3 transition-all duration-300 ${
              isUpdatePatchPending ? 'bg-warning/10' : 'bg-success/10 scale-110'
            }`}
          >
            <div className="transition-opacity duration-300">
              {isUpdatePatchPending ? (
                <RiAlertFill className="text-warning animate-in fade-in size-6" />
              ) : (
                <CheckCircleIcon className="text-success animate-in fade-in size-6" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div>
              <AlertDialogTitle className="transition-all duration-300">
                {isUpdatePatchPending ? 'Saving changes' : 'Changes saved!'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="transition-all duration-300">
              {isUpdatePatchPending ? 'Please wait while we save your changes' : 'Workflow has been saved successfully'}
            </AlertDialogDescription>
          </div>
          {isUpdatePatchPending && (
            <button onClick={onCancel} className="text-gray-500">
              <RiCloseFill className="size-4" />
            </button>
          )}
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const useWorkflow = createContextHook(WorkflowContext);
