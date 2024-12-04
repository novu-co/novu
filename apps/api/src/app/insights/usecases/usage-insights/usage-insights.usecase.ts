import { Injectable } from '@nestjs/common';
import { MessageRepository, NotificationRepository } from '@novu/dal';
import { InstrumentUsecase } from '@novu/application-generic';

import { UsageInsightsCommand } from './usage-insights.command';

interface IUsageInsightsResponse {
  totalNotifications: number;
  totalMessages: number;
}

@Injectable()
export class UsageInsights {
  constructor(
    private notificationRepository: NotificationRepository,
    private messageRepository: MessageRepository
  ) {}

  @InstrumentUsecase()
  async execute(command: UsageInsightsCommand): Promise<IUsageInsightsResponse> {
    const query = {
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
    };

    const [totalNotifications, totalMessages] = await Promise.all([
      this.notificationRepository.count(query),
      this.messageRepository.count(query),
    ]);

    return {
      totalNotifications,
      totalMessages,
    };
  }
}
