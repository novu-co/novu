import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SharedModule } from '../shared/shared.module';
import { CreateSupportThreadUsecase } from './usecases/create-thread.usecase';

@Module({
  imports: [SharedModule],
  controllers: [SupportController],
  providers: [CreateSupportThreadUsecase],
})
export class SupportModule {}
