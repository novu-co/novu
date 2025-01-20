import { ConfigureWorkflowForm } from '@/components/workflow-editor/configure-workflow-form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { WorkflowActions } from './workflow-actions';

export function ConfigureWorkflow() {
  const { workflow, update } = useWorkflow();

  if (!workflow) {
    return null;
  }

  return (
    <>
      <ConfigureWorkflowForm workflow={workflow} update={update} />
      <WorkflowActions workflow={workflow} />
    </>
  );
}
