import { Module } from '@nestjs/common';
import { SupportService } from '@novu/application-generic';
import { OrganizationRepository } from '@novu/dal';
import { SupportController } from './support.controller';
import { SharedModule } from '../shared/shared.module';
import { CreateSupportThreadUsecase, FetchUserOrganizationsUsecase } from './usecases';

@Module({
  imports: [SharedModule],
  controllers: [SupportController],
  providers: [CreateSupportThreadUsecase, FetchUserOrganizationsUsecase, SupportService, OrganizationRepository],
})
export class SupportModule {}
