import { Injectable, NotFoundException } from '@nestjs/common';
import { EnvironmentEntity, EnvironmentRepository } from '@novu/dal';
import { GetDecryptedSecretKeyCommand } from './get-decrypted-secret-key.command';
import { decryptApiKey } from '../../encryption';
import { Instrument, InstrumentUsecase } from '../../instrumentation';

@Injectable()
export class GetDecryptedSecretKey {
  constructor(private readonly environmentRepository: EnvironmentRepository) {}

  @InstrumentUsecase()
  async execute(command: GetDecryptedSecretKeyCommand): Promise<string> {
    const environment = await this.getEnvironment(command.environmentId);

    return this.decryptApiKey(environment.apiKeys[0].key);
  }

  @Instrument()
  async decryptApiKey(key: string): Promise<string> {
    return decryptApiKey(key);
  }

  @Instrument()
  async getEnvironment(environmentId: string): Promise<EnvironmentEntity> {
    const environment = await this.environmentRepository.findOne({
      _id: environmentId,
    });

    if (!environment) {
      throw new NotFoundException(`Environment ${environmentId} not found`);
    }

    return environment;
  }
}
