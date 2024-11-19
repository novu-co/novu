import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import ErrorPage from '@/components/error-page';
import { RootRoute, AuthRoute, DashboardRoute, CatchAllRoute } from './routes';
import { WorkflowsPage, SignInPage, SignUpPage, OrganizationListPage } from '@/pages';
import './index.css';
import { ROUTES } from './utils/routes';
import { EditWorkflowPage } from './pages/edit-workflow';
import { TestWorkflowPage } from './pages/test-workflow';
import { ConfigureWorkflow } from './components/workflow-editor/configure-workflow';
import { ConfigureStep } from './components/workflow-editor/steps/configure-step';
import { initializeSentry } from './utils/sentry';
import { EditStepSidebar } from './components/workflow-editor/steps/edit-step-sidebar';
import { overrideZodErrorMap } from './utils/validation';

initializeSentry();
overrideZodErrorMap();

const router = createBrowserRouter([
  {
    element: <RootRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthRoute />,
        children: [
          {
            path: `${ROUTES.SIGN_IN}/*`,
            element: <SignInPage />,
          },
          {
            path: `${ROUTES.SIGN_UP}/*`,
            element: <SignUpPage />,
          },
          {
            path: ROUTES.SIGNUP_ORGANIZATION_LIST,
            element: <OrganizationListPage />,
          },
        ],
      },
      {
        path: ROUTES.ROOT,
        element: <DashboardRoute />,
        children: [
          {
            path: ROUTES.ENV,
            children: [
              {
                path: ROUTES.WORKFLOWS,
                element: <WorkflowsPage />,
              },
              {
                path: ROUTES.EDIT_WORKFLOW,
                element: <EditWorkflowPage />,
                children: [
                  {
                    element: <ConfigureWorkflow />,
                    index: true,
                  },
                  {
                    element: <ConfigureStep />,
                    path: ROUTES.CONFIGURE_STEP,
                  },
                  {
                    element: <EditStepSidebar />,
                    path: ROUTES.EDIT_STEP,
                  },
                ],
              },
              {
                path: ROUTES.TEST_WORKFLOW,
                element: <TestWorkflowPage />,
              },
              {
                path: '*',
                element: <CatchAllRoute />,
              },
            ],
          },
          {
            path: '*',
            element: <CatchAllRoute />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
