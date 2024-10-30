import { EditWorkflowLayout } from '@/components/edit-workflow-layout';
import { WorkflowEditor } from '@/components/workflow-editor/workflow-editor';
import { WorkflowEditorProvider } from '@/components/workflow-editor/workflow-editor-provider';
import { EditorBreadcrumbs } from '@/components/workflow-editor/editor-breadcrumbs';
import { Toaster } from '@/components/primitives/sonner';
import { AnimatedOutlet } from '@/components/animated-outlet';

const asideClassName =
  'text-foreground-950 flex h-full w-[300px] max-w-[350px] flex-col border-l pb-5 pt-3.5 [&_input]:text-xs [&_input]:text-neutral-600 [&_label]:text-xs [&_label]:font-medium [&_textarea]:text-xs [&_textarea]:text-neutral-600';

export const EditWorkflowPage = () => {
  return (
    <WorkflowEditorProvider>
      <EditWorkflowLayout headerStartItems={<EditorBreadcrumbs />}>
        <div className="flex h-full flex-1 flex-nowrap">
          <WorkflowEditor />
          <aside className={asideClassName}>
            <AnimatedOutlet />
          </aside>
          <Toaster />
        </div>
      </EditWorkflowLayout>
    </WorkflowEditorProvider>
  );
};
