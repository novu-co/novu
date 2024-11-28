import { ConfigureWorkflowForm } from '@/components/workflow-editor/configure-workflow-form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';

export function ConfigureWorkflow() {
  const { workflow, debouncedUpdate, patch, onDirtyChange } = useWorkflow();

  if (!workflow) {
    return null;
  }

  return (
    <ConfigureWorkflowForm
      workflow={workflow}
      debouncedUpdate={debouncedUpdate}
      patch={patch}
      onDirtyChange={onDirtyChange}
    />
  );
}
