import { JobTopicNameEnum } from '@novu/shared';

import { WorkerBaseService } from './index';
import { type BullMqService } from '../bull-mq';

const LOG_CONTEXT = 'WorkflowWorkerService';

export class WorkflowWorkerService extends WorkerBaseService {
  constructor(public bullMqService: BullMqService) {
    super(JobTopicNameEnum.WORKFLOW, bullMqService);
  }
}
