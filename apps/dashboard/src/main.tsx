import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import ErrorPage from '@/components/error-page';
import { RootRoute, AuthRoute, DashboardRoute, CatchAllRoute } from './routes';
import { OnboardingParentRoute } from './routes/onboarding';
import {
  WorkflowsPage,
  SignInPage,
  SignUpPage,
  OrganizationListPage,
  QuestionnairePage,
  UsecaseSelectPage,
  WelcomePage,
} from '@/pages';
import './index.css';
import { ROUTES } from './utils/routes';
import { EditWorkflowPage } from './pages/edit-workflow';
import { TestWorkflowPage } from './pages/test-workflow';
import { initializeSentry } from './utils/sentry';
import { overrideZodErrorMap } from './utils/validation';
import { InboxUsecasePage } from './pages/inbox-usecase-page';
import { InboxEmbedPage } from './pages/inbox-embed-page';
import { FeatureFlagsProvider } from '@/context/feature-flags-provider';
import { EditStepTemplate } from '@/components/workflow-editor/steps/edit-step-template';
import { ConfigureWorkflow } from '@/components/workflow-editor/configure-workflow';
import { EditStep } from '@/components/workflow-editor/steps/edit-step';
import { InboxEmbedSuccessPage } from './pages/inbox-embed-success-page';

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
          {
            path: ROUTES.SIGNUP_QUESTIONNAIRE,
            element: <QuestionnairePage />,
          },
        ],
      },
      {
        path: '/onboarding',
        element: <OnboardingParentRoute />,
        children: [
          {
            path: ROUTES.USECASE_SELECT,
            element: <UsecaseSelectPage />,
          },
          {
            path: ROUTES.INBOX_USECASE,
            element: <InboxUsecasePage />,
          },
          {
            path: ROUTES.INBOX_EMBED,
            element: <InboxEmbedPage />,
          },
          {
            path: ROUTES.INBOX_EMBED_SUCCESS,
            element: <InboxEmbedSuccessPage />,
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
                path: ROUTES.WELCOME,
                element: <WelcomePage />,
              },
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
                    element: <EditStep />,
                    path: ROUTES.EDIT_STEP,
                  },
                  {
                    element: <EditStepTemplate />,
                    path: ROUTES.EDIT_STEP_TEMPLATE,
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
    <FeatureFlagsProvider>
      <RouterProvider router={router} />
    </FeatureFlagsProvider>
  </StrictMode>
);
