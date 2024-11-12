import { Link, useParams } from 'react-router-dom';
import { useWatch, useFormContext } from 'react-hook-form';
import * as z from 'zod';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../primitives/tabs';
import { WorkflowCanvas } from './workflow-canvas';
import { workflowSchema } from './schema';
import { buildRoute, ROUTES } from '@/utils/routes';

export const WorkflowEditor = () => {
  const { environmentSlug = '', workflowSlug = '' } = useParams<{ environmentSlug: string; workflowSlug: string }>();
  const form = useFormContext<z.infer<typeof workflowSchema>>();
  const steps = useWatch({
    control: form.control,
    name: 'steps',
  });

  return (
    <div className="flex h-full flex-1 flex-nowrap">
      <Tabs defaultValue="workflow" className="-mt-px flex h-full flex-1 flex-col" value="workflow">
        <TabsList variant="regular">
          <TabsTrigger value="workflow" asChild variant="regular">
            <Link
              to={buildRoute(ROUTES.EDIT_WORKFLOW, {
                environmentSlug,
                workflowSlug,
              })}
            >
              Workflow
            </Link>
          </TabsTrigger>
          <TabsTrigger value="trigger" asChild variant="regular">
            <Link
              to={buildRoute(ROUTES.TEST_WORKFLOW, {
                environmentSlug,
                workflowSlug,
              })}
            >
              Trigger
            </Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="workflow" className="mt-0 h-full w-full" variant="regular">
          {steps && <WorkflowCanvas steps={steps} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
