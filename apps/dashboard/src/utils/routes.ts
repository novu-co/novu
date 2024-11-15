export const ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGNUP_ORGANIZATION_LIST: '/sign-up/organization-list',
  ROOT: '/',
  ENV: '/env',
  WORKFLOWS: '/env/:environmentSlug/workflows',
  EDIT_WORKFLOW: '/env/:environmentSlug/workflows/:workflowSlug',
  TEST_WORKFLOW: '/env/:environmentSlug/workflows/:workflowSlug/test',
  CONFIGURE_STEP: 'steps/:stepSlug',
  EDIT_STEP: 'steps/:stepSlug/edit',
};

export const buildRoute = (route: string, params: Record<string, string>) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`:${key}`, value);
  }, route);
};

export const LEGACY_ROUTES = {
  ACTIVITY_FEED: '/legacy/activities',
  INTEGRATIONS: '/legacy/integrations',
  API_KEYS: '/legacy/api-keys',
  BILLING: '/legacy/manage-account/billing',
  INVITE_TEAM_MEMBERS: '/legacy/manage-account/team-members',
  SETTINGS: '/legacy/manage-account/user-profile',
  EDIT_WORKFLOW: '/legacy/workflows/edit/:workflowId',
  TEST_WORKFLOW: '/legacy/workflows/edit/:workflowId/test-workflow',
};
