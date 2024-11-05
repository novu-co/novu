import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { NovuController } from './novu.controller';

@Module({
  imports: [SharedModule, AuthModule],
  providers: [],
  controllers: [NovuController],
})
export class NovuModule {}
