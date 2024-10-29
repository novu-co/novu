import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/primitives/sonner';
import { EditWorkflowLayout } from '@/components/edit-workflow-layout';
import { WorkflowEditor } from '@/components/workflow-editor/workflow-editor';
import { WorkflowEditorProvider } from '@/components/workflow-editor/workflow-editor-provider';
import { EditorBreadcrumbs } from '@/components/workflow-editor/editor-breadcrumbs';

export const EditWorkflowPage = () => {
  return (
    <WorkflowEditorProvider>
      <EditWorkflowLayout headerStartItems={<EditorBreadcrumbs />}>
        <div className="flex h-full flex-1 flex-nowrap">
          <WorkflowEditor />
          <Outlet />
          <Toaster />
        </div>
      </EditWorkflowLayout>
    </WorkflowEditorProvider>
  );
};
