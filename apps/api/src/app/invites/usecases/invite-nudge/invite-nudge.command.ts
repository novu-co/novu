import { IsObject, IsString } from 'class-validator';
import { SubscriberEntity } from '@novu/dal';
import { BaseCommand } from '@novu/application-generic';

export class InviteNudgeWebhookCommand extends BaseCommand {
  @IsString()
  hmacHeader: string;

  @IsObject()
  subscriber: SubscriberEntity;

  @IsString()
  organizationId: string;
}
