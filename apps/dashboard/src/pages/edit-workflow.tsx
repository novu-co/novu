import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { EditWorkflowLayout } from '@/components/edit-workflow-layout';
import { ArrowRight, RouteFill } from '@/components/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/primitives/breadcrumb';
import { Button } from '@/components/primitives/button';
import { formSchema } from '@/components/workflow-editor/schema';
import { WorkflowEditor } from '@/components/workflow-editor/workflow-editor';
import { WorkflowEditorProvider } from '@/components/workflow-editor/workflow-editor-provider';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import { Toaster } from '@/components/primitives/sonner';
import { AnimatedOutlet } from '@/components/animated-outlet';

const asideClassName =
  'text-foreground-950 flex h-full w-[300px] max-w-[350px] flex-col border-l pb-5 pt-3.5 [&_input]:text-xs [&_input]:text-neutral-600 [&_label]:text-xs [&_label]:font-medium [&_textarea]:text-xs [&_textarea]:text-neutral-600';

export const EditWorkflowPage = () => {
  return (
    <WorkflowEditorProvider>
      <EditWorkflowLayout headerStartItems={<StartItems />}>
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

const StartItems = () => {
  const { currentEnvironment } = useEnvironment();
  const navigate = useNavigate();
  const workflowsRoute = buildRoute(ROUTES.WORKFLOWS, { environmentId: currentEnvironment?._id ?? '' });
  const { getValues } = useFormContext<z.infer<typeof formSchema>>();

  const breadcrumbs = [
    { label: currentEnvironment?.name, href: workflowsRoute },
    {
      label: 'Workflows',
      href: workflowsRoute,
    },
  ];

  const handleBackNav = () => {
    navigate(workflowsRoute);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="link" onClick={handleBackNav}>
        <ArrowRight className="text-neutral-950" />
      </Button>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map(({ label, href }) => (
            <React.Fragment key={`${href}_${label}`}>
              <BreadcrumbItem>
                <BreadcrumbLink to={href}>{label}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>
              <RouteFill />
              {getValues('name')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
