import { Injectable, Logger } from '@nestjs/common';
import { DetailEnum, ExecutionLogRoute, ExecutionLogRouteCommand } from '@novu/application-generic';
import { JobEntity, JobRepository, JobStatusEnum, MessageRepository } from '@novu/dal';
import { ExecutionDetailsSourceEnum, ExecutionDetailsStatusEnum, IThrottleMetadata, StepTypeEnum } from '@novu/shared';

import { PlatformException } from '../../../../shared/utils';
import { SendMessageType } from '../send-message-type.usecase';
import { SendMessageCommand } from '../send-message.command';

const LOG_CONTEXT = 'Throttle';

@Injectable()
export class Throttle extends SendMessageType {
  constructor(
    protected messageRepository: MessageRepository,
    protected executionLogRoute: ExecutionLogRoute,
    protected jobRepository: JobRepository
  ) {
    super(messageRepository, executionLogRoute);
  }

  public async execute(command: SendMessageCommand) {
    const currentJob = await this.getCurrentJob(command);
    const throttleMetadata = currentJob.step?.metadata as unknown as IThrottleMetadata;

    if (!throttleMetadata?.amount || !throttleMetadata?.timeValue || !throttleMetadata?.timeUnit) {
      throw new PlatformException('Throttle step is missing required configuration');
    }

    const timeWindowStart = this.calculateTimeWindowStart(throttleMetadata);
    const recentJobs = await this.getRecentJobs(command, timeWindowStart);

    if (recentJobs.length >= throttleMetadata.amount) {
      await this.jobRepository.updateStatus(command.environmentId, command.jobId, JobStatusEnum.CANCELED);
      await this.logThrottled(command, recentJobs.length);

      return;
    }

    await this.logSuccess(command);
  }

  private calculateTimeWindowStart(metadata: IThrottleMetadata): Date {
    const now = new Date();
    const msMultiplier = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };

    const timeWindowMs = metadata.timeValue * msMultiplier[metadata.timeUnit];

    return new Date(now.getTime() - timeWindowMs);
  }

  private async getRecentJobs(command: SendMessageCommand, timeWindowStart: Date): Promise<JobEntity[]> {
    return await this.jobRepository.find({
      _environmentId: command.environmentId,
      _subscriberId: command._subscriberId,
      type: StepTypeEnum.THROTTLE,
      createdAt: { $gte: timeWindowStart },
      status: { $ne: JobStatusEnum.CANCELED },
      _id: { $ne: command.jobId },
    });
  }

  private async getCurrentJob(command: SendMessageCommand) {
    const currentJob = await this.jobRepository.findOne({
      _environmentId: command.environmentId,
      _id: command.jobId,
    });

    if (!currentJob) {
      const message = `Throttle job ${command.jobId} is not found`;
      Logger.error(message, LOG_CONTEXT);
      throw new PlatformException(message);
    }

    return currentJob;
  }

  private async logThrottled(command: SendMessageCommand, currentCount: number) {
    await this.executionLogRoute.execute(
      ExecutionLogRouteCommand.create({
        ...ExecutionLogRouteCommand.getDetailsFromJob(command.job),
        detail: DetailEnum.THROTTLED,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.SUCCESS,
        isTest: false,
        isRetry: false,
        raw: JSON.stringify({ currentCount }),
      })
    );
  }

  private async logSuccess(command: SendMessageCommand) {
    await this.executionLogRoute.execute(
      ExecutionLogRouteCommand.create({
        ...ExecutionLogRouteCommand.getDetailsFromJob(command.job),
        detail: DetailEnum.THROTTLE_PROCESSED,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.SUCCESS,
        isTest: false,
        isRetry: false,
      })
    );
  }
}
