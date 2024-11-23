import { Module } from '@nestjs/common';
import { SupportService } from '@novu/application-generic';
import { SupportController } from './support.controller';
import { SharedModule } from '../shared/shared.module';
import { CreateSupportThreadUsecase } from './usecases/create-thread.usecase';

@Module({
  imports: [SharedModule],
  controllers: [SupportController],
  providers: [CreateSupportThreadUsecase, SupportService],
})
export class SupportModule {}
