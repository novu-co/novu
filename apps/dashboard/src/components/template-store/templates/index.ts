import { accessTokenTemplate } from './access-token';
import { usageLimitTemplate } from './usage-limit';

import { WorkflowTemplate } from './types';

export function getTemplates(): WorkflowTemplate[] {
  return [accessTokenTemplate, usageLimitTemplate];
}

export * from './types';
