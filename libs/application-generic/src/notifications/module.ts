import { NovuModule } from '@novu/framework/nest';
import { testWorkflow } from './workflows/test.workflow';

export function getNovuNotificationsModule() {
  return NovuModule.register({
    apiPath: '/api/novu',
    workflows: [testWorkflow],
  });
}
