import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EnvironmentRepository } from '@novu/dal';
import { DeleteEnvironmentCommand } from './delete-environment.command';

@Injectable()
export class DeleteEnvironment {
  constructor(private environmentRepository: EnvironmentRepository) {}

  async execute(command: DeleteEnvironmentCommand): Promise<void> {
    const environment = await this.environmentRepository.findOne({
      _id: command.environmentId,
      _organizationId: command.organizationId,
    });

    if (!environment) {
      throw new NotFoundException(`Environment ${command.environmentId} not found`);
    }

    const protectedEnvironments = ['Development', 'Production'];
    if (protectedEnvironments.includes(environment.name)) {
      throw new BadRequestException(
        `The ${environment.name} environment is protected and cannot be deleted. Only custom environments can be deleted.`
      );
    }

    await this.environmentRepository.delete({
      _id: command.environmentId,
      _organizationId: command.organizationId,
    });
  }
}
