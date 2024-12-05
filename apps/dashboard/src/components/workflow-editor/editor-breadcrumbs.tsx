import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCode } from 'react-icons/fa6';
import { WorkflowOriginEnum } from '@novu/shared';

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
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useFetchWorkflow } from '@/hooks/use-fetch-workflow';
import TruncatedText from '@/components/truncated-text';
import { Badge } from '@/components/primitives/badge';

export const EditorBreadcrumbs = () => {
  const { workflowSlug = '' } = useParams<{ workflowSlug: string }>();
  const { currentEnvironment } = useEnvironment();
  const navigate = useNavigate();
  const workflowsRoute = buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment?.slug ?? '' });
  const { workflow } = useFetchWorkflow({
    workflowSlug,
  });

  const breadcrumbs = [
    { label: currentEnvironment?.name, href: workflowsRoute },
    {
      label: 'Workflows',
      href: workflowsRoute,
      node: (
        <Badge kind="pill" size="2xs" className="no-underline">
          BETA
        </Badge>
      ),
    },
  ];

  const handleBackNav = () => {
    navigate(workflowsRoute);
  };

  return (
    <div className="flex items-center overflow-hidden">
      <Button variant="link" onClick={handleBackNav}>
        <ArrowRight className="text-neutral-950" />
      </Button>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map(({ label, href, node }) => (
            <React.Fragment key={`${href}_${label}`}>
              <BreadcrumbItem className="flex items-center gap-1">
                <BreadcrumbLink to={href}>{label}</BreadcrumbLink>
                {node}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            {workflow && (
              <BreadcrumbPage className="flex items-center gap-1">
                {workflow.origin === WorkflowOriginEnum.EXTERNAL ? (
                  <Badge variant="warning" kind="pill" size="2xs">
                    <FaCode className="size-3.5" />
                  </Badge>
                ) : (
                  <RouteFill className="size-4" />
                )}
                <div className="flex max-w-[32ch]">
                  <TruncatedText>{workflow?.name}</TruncatedText>
                </div>
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
