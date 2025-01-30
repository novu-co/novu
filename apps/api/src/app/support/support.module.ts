import { Module } from '@nestjs/common';
import { SupportService } from '@novu/application-generic';
import { OrganizationRepository, UserRepository } from '@novu/dal';
import { SupportController } from './support.controller';
import { SharedModule } from '../shared/shared.module';
import { CreateSupportThreadUsecase, PlainCardsUsecase } from './usecases';
import { PlainCardsGuard } from './guards/plain-cards.guard';

@Module({
  imports: [SharedModule],
  controllers: [SupportController],
  providers: [
    CreateSupportThreadUsecase,
    PlainCardsUsecase,
    SupportService,
    OrganizationRepository,
    UserRepository,
    PlainCardsGuard,
  ],
})
export class SupportModule {}
