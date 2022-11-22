import { Inject, Injectable } from '@nestjs/common';
import { MessageRepository } from '@novu/dal';
import { AnalyticsService } from '../../../shared/services/analytics/analytics.service';
import { QueueService } from '../../../shared/services/queue';
import { ANALYTICS_SERVICE } from '../../../shared/shared.module';
import { MarkAllMessageAsSeenCommand } from './mark-all-message-as-seen.command';
import { UpdateMessageCommand, UpdateMessage } from '../../../messages/usecases/update-message';

@Injectable()
export class MarkAllMessageAsSeen {
  constructor(
    private messageRepository: MessageRepository,
    private queueService: QueueService,
    private updateMessageUsecase: UpdateMessage,
    @Inject(ANALYTICS_SERVICE) private analyticsService: AnalyticsService
  ) {}

  async execute(command: MarkAllMessageAsSeenCommand): Promise<number> {
    const response = await this.updateMessageUsecase.execute(
      UpdateMessageCommand.create({
        query: { _subscriberId: command._subscriberId, _environmentId: command.environmentId, seen: false },
        updateBody: { $set: { seen: true, lastSeenDate: new Date() } },
        environmentId: command.environmentId,
        organizationId: command.organizationId,
        subscriberId: command.subscriberId,
        invalidate: true,
      })
    );

    this.queueService.wsSocketQueue.add({
      event: 'unseen_count_changed',
      userId: command.subscriberId,
      payload: {
        unseenCount: 0,
      },
    });

    this.analyticsService.track('Mark all message as seen - [Notification Center]', command.organizationId, {
      _organization: command.organizationId,
    });

    return response.modified;
  }
}
