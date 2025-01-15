import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';

import { encryptApiKey } from '@novu/application-generic';
import { EnvironmentRepository, NotificationGroupRepository } from '@novu/dal';

import { CreateDefaultLayout, CreateDefaultLayoutCommand } from '../../../layouts/usecases';
import { GenerateUniqueApiKey } from '../generate-unique-api-key/generate-unique-api-key.usecase';
import { CreateEnvironmentCommand } from './create-environment.command';

@Injectable()
export class CreateEnvironment {
  constructor(
    private environmentRepository: EnvironmentRepository,
    private notificationGroupRepository: NotificationGroupRepository,
    private generateUniqueApiKey: GenerateUniqueApiKey,
    private createDefaultLayoutUsecase: CreateDefaultLayout
  ) {}

  private getEnvironmentColor(name: string, commandColor?: string): string | undefined {
    if (name === 'Development') return '#ff8547';
    if (name === 'Production') return '#7e52f4';

    return commandColor;
  }

  async execute(command: CreateEnvironmentCommand) {
    const environmentCount = await this.environmentRepository.count({
      _organizationId: command.organizationId,
    });

    if (environmentCount >= 10) {
      throw new BadRequestException('Organization cannot have more than 10 environments');
    }

    if (!command.system) {
      const { name } = command;

      if (name === 'Development' || name === 'Production') {
        throw new UnprocessableEntityException('Environment name cannot be Development or Production');
      }

      const environment = await this.environmentRepository.findOne({
        _organizationId: command.organizationId,
        name,
      });

      if (environment) {
        throw new BadRequestException('Environment name must be unique');
      }
    }

    const key = await this.generateUniqueApiKey.execute();
    const encryptedApiKey = encryptApiKey(key);
    const hashedApiKey = createHash('sha256').update(key).digest('hex');

    const environment = await this.environmentRepository.create({
      _organizationId: command.organizationId,
      name: command.name,
      identifier: nanoid(12),
      _parentId: command.parentEnvironmentId,
      color: this.getEnvironmentColor(command.name, command.color),
      apiKeys: [
        {
          key: encryptedApiKey,
          _userId: command.userId,
          hash: hashedApiKey,
        },
      ],
    });

    if (!command.parentEnvironmentId) {
      await this.notificationGroupRepository.create({
        _environmentId: environment._id,
        _organizationId: command.organizationId,
        name: 'General',
      });

      await this.createDefaultLayoutUsecase.execute(
        CreateDefaultLayoutCommand.create({
          organizationId: command.organizationId,
          environmentId: environment._id,
          userId: command.userId,
        })
      );
    }

    if (command.parentEnvironmentId) {
      const group = await this.notificationGroupRepository.findOne({
        _organizationId: command.organizationId,
        _environmentId: command.parentEnvironmentId,
      });

      await this.notificationGroupRepository.create({
        _environmentId: environment._id,
        _organizationId: command.organizationId,
        name: group?.name,
        _parentId: group?._id,
      });
    }

    return environment;
  }
}
