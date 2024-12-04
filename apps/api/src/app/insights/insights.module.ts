import { Module } from '@nestjs/common';
import {
  OrganizationRepository,
  MessageRepository,
  NotificationRepository,
  CommunityOrganizationRepository,
} from '@novu/dal';
import { EEOrganizationRepository } from '@novu/ee-auth';
import { USE_CASES } from './usecases';
import { SharedModule } from '../shared/shared.module';
import { InsightsInitializerService } from './services/insights-initializer.service';

@Module({
  imports: [SharedModule],
  providers: [
    ...USE_CASES,
    InsightsInitializerService,
    OrganizationRepository,
    MessageRepository,
    NotificationRepository,
    EEOrganizationRepository,
    CommunityOrganizationRepository,
  ],
  exports: [...USE_CASES],
})
export class InsightsModule {}
