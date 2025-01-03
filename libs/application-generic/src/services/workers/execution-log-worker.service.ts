import { JobTopicNameEnum } from '@novu/shared';

import { WorkerBaseService } from './worker-base.service';
import { BullMqService } from '../bull-mq';

const LOG_CONTEXT = 'ExecutionLogWorkerService';

export class ExecutionLogWorkerService extends WorkerBaseService {
  constructor(public bullMqService: BullMqService) {
    super(JobTopicNameEnum.EXECUTION_LOG, bullMqService);
  }
}
