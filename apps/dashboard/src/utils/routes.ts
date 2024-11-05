export const ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGNUP_ORGANIZATION_LIST: '/sign-up/organization-list',
  ROOT: '/',
  ENV: '/env',
  WORKFLOWS: '/env/:environmentSlug/workflows',
  EDIT_WORKFLOW: '/env/:environmentSlug/workflows/:workflowSlug',
  TEST_WORKFLOW: '/env/:environmentSlug/workflows/:workflowSlug/test',
  CONFIGURE_STEP: 'steps/:stepId',
  EDIT_STEP: 'steps/:stepId/edit',
};

export const buildRoute = (route: string, params: Record<string, string>) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`:${key}`, value);
  }, route);
};

export enum ROUTES_TEMPLATE {
  SIGN_IN = '/sign-in',
  SIGN_UP = '/sign-up',
  SIGNUP_ORGANIZATION_LIST = '/sign-up/organization-list',
  ROOT = '/',
  ENV = '/env',
  WORKFLOWS = '/env/{0}/workflows',
  EDIT_WORKFLOW = '/env/{0}/workflows/{1}',
  TEST_WORKFLOW = '/env/{0}/workflows/{1}/test',
  CONFIGURE_STEP = 'steps/{0}',
  EDIT_STEP = 'steps/{0}/edit',
}

export const buildRoute2 = (route: ROUTES_TEMPLATE, ...params: string[]) => {
  return formatString(route, ...params);
};

/**
 * Replaces placeholders in a template string with provided arguments.
 *
 * @param {string} template - The template string containing placeholders `{0}`, `{1}`, etc.
 * @param {...string} args - The values to replace placeholders with, provided in order.
 * @returns {string} - The formatted string with all placeholders replaced by respective values.
 *
 * @example
 * // Returns "first something second"
 * formatString("{0} something {1}", "first", "second");
 */
function formatString(template: string, ...args: string[]) {
  return template.replace(/{(\d+)}/g, (_match, index) => args[index] || '');
}

export const LEGACY_ROUTES = {
  ACTIVITY_FEED: '/legacy/activities',
  INTEGRATIONS: '/legacy/integrations',
  API_KEYS: '/legacy/api-keys',
  BILLING: '/legacy/manage-account/billing',
  INVITE_TEAM_MEMBERS: '/legacy/manage-account/team-members',
  SETTINGS: '/legacy/manage-account/user-profile',
  EDIT_WORKFLOW: '/legacy/workflows/edit/:workflowId',
};
