export const ROUTES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  SIGNUP_ORGANIZATION_LIST: '/auth/organization-list',
  SIGNUP_QUESTIONNAIRE: '/onboarding/questionnaire',
  USECASE_SELECT: '/onboarding/usecase',
  INBOX_USECASE: '/onboarding/inbox',
  INBOX_EMBED: '/onboarding/inbox/embed',
  INBOX_EMBED_SUCCESS: '/onboarding/inbox/success',
  ROOT: '/',
  ENV: '/env',
  SETTINGS: '/settings',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_ORGANIZATION: '/settings/organization',
  SETTINGS_TEAM: '/settings/team',
  WORKFLOWS: '/env/:environmentSlug/workflows',
  EDIT_WORKFLOW: '/env/:environmentSlug/workflows/:workflowSlug',
  TEST_WORKFLOW: '/env/:environmentSlug/workflows/:workflowSlug/test',
  WELCOME: '/env/:environmentSlug/welcome',
  EDIT_WORKFLOW_PREFERENCES: 'preferences',
  EDIT_STEP: 'steps/:stepSlug',
  EDIT_STEP_TEMPLATE: 'steps/:stepSlug/edit',
  API_KEYS: '/env/:environmentSlug/api-keys',
} as const;

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
