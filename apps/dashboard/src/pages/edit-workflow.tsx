import { EditWorkflowLayout } from '@/components/edit-workflow-layout';
import { WorkflowEditor } from '@/components/workflow-editor/workflow-editor';
import { WorkflowEditorProvider } from '@/components/workflow-editor/workflow-editor-provider';
import { EditorBreadcrumbs } from '@/components/workflow-editor/editor-breadcrumbs';
import { AnimatedOutlet } from '@/components/animated-outlet';

export const EditWorkflowPage = () => {
  return (
    <WorkflowEditorProvider>
      <EditWorkflowLayout headerStartItems={<EditorBreadcrumbs />}>
        <div className="flex h-full flex-1 flex-nowrap">
          <WorkflowEditor />
          <aside className="text-foreground-950 [&_textarea]:text-neutral-600'; flex h-full w-[300px] max-w-[350px] flex-col border-l [&_input]:text-xs [&_input]:text-neutral-600 [&_label]:text-xs [&_label]:font-medium [&_textarea]:text-xs">
            <AnimatedOutlet />
          </aside>
        </div>
      </EditWorkflowLayout>
    </WorkflowEditorProvider>
  );
};
