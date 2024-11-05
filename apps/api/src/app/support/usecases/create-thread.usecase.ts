import { Injectable } from '@nestjs/common';
import { SupportService } from '@novu/application-generic';
import { CreateSupportThreadCommand } from './create-thread.command';
import { capitalize } from '../../shared/services/helper/helper.service';

@Injectable()
export class CreateSupportThreadUsecase {
  constructor(private supportService: SupportService) {}

  async execute(command: CreateSupportThreadCommand) {
    const firstName = capitalize(command.firstName ?? '');
    const lastName = capitalize(command.lastName ?? '');
    const plainCustomer = await this.supportService.upsertCustomer({
      emailAddress: command.email,
      fullName: `${firstName} ${lastName}`,
    });

    await this.supportService.createThread({
      plainCustomerId: plainCustomer.data?.customer.id,
      threadTitle: command.title,
      threadText: command.text,
    });

    return {
      success: true,
      message: 'Thread created successfully',
    };
  }
}
