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
  ApiKeysPage,
  WelcomePage,
  IntegrationsListPage,
  SettingsPage,
  ActivityFeed,
} from '@/pages';
import './index.css';
import { ROUTES } from './utils/routes';
import { EditWorkflowPage } from './pages/edit-workflow';
import { TestWorkflowPage } from './pages/test-workflow';
import { initializeSentry } from './utils/sentry';
import { overrideZodErrorMap } from './utils/validation';
import { InboxUsecasePage } from './pages/inbox-usecase-page';
import { InboxEmbedPage } from './pages/inbox-embed-page';
import { ConfigureWorkflow } from '@/components/workflow-editor/configure-workflow';
import { InboxEmbedSuccessPage } from './pages/inbox-embed-success-page';
import { ChannelPreferences } from './components/workflow-editor/channel-preferences';
import { FeatureFlagsProvider } from './context/feature-flags-provider';
import { ConfigureStep } from '@/components/workflow-editor/steps/configure-step';
import { ConfigureStepTemplate } from '@/components/workflow-editor/steps/configure-step-template';
import { RedirectToLegacyStudioAuth } from './pages/redirect-to-legacy-studio-auth';
import { CreateIntegrationSidebar } from './components/integrations/components/create-integration-sidebar';
import { UpdateIntegrationSidebar } from './components/integrations/components/update-integration-sidebar';

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
        path: '/onboarding',
        element: <OnboardingParentRoute />,
        children: [
          {
            path: ROUTES.SIGNUP_QUESTIONNAIRE,
            element: <QuestionnairePage />,
          },
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
                path: ROUTES.API_KEYS,
                element: <ApiKeysPage />,
              },
              {
                path: ROUTES.ACTIVITY_FEED,
                element: <ActivityFeed />,
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
                    path: ROUTES.EDIT_STEP,
                  },
                  {
                    element: <ConfigureStepTemplate />,
                    path: ROUTES.EDIT_STEP_TEMPLATE,
                  },
                  {
                    element: <ChannelPreferences />,
                    path: ROUTES.EDIT_WORKFLOW_PREFERENCES,
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
            path: ROUTES.INTEGRATIONS,
            element: <IntegrationsListPage />,
            children: [
              {
                path: ROUTES.INTEGRATIONS_CONNECT,
                element: <CreateIntegrationSidebar isOpened />,
              },
              {
                path: ROUTES.INTEGRATIONS_CONNECT_PROVIDER,
                element: <CreateIntegrationSidebar isOpened />,
              },
              {
                path: ROUTES.INTEGRATIONS_UPDATE,
                element: <UpdateIntegrationSidebar isOpened />,
              },
            ],
          },
          {
            path: ROUTES.INTEGRATIONS,
            element: <IntegrationsListPage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.SETTINGS_ACCOUNT,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.SETTINGS_ORGANIZATION,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.SETTINGS_TEAM,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.SETTINGS_BILLING,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.LOCAL_STUDIO_AUTH,
            element: <RedirectToLegacyStudioAuth />,
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
