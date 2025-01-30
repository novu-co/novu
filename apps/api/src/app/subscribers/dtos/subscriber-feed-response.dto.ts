import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriberFeedResponseDto {
  @ApiPropertyOptional({
    description:
      'The internal ID generated by Novu for your subscriber. ' +
      'This ID does not match the `subscriberId` used in your queries. Refer to `subscriberId` for that identifier.',
    type: String,
  })
  _id?: string;

  @ApiProperty({
    description: 'The first name of the subscriber.',
    type: String,
  })
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the subscriber.',
    type: String,
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: "The URL of the subscriber's avatar image.",
    type: String,
  })
  avatar?: string;

  @ApiProperty({
    description:
      'The identifier used to create this subscriber, which typically corresponds to the user ID in your system.',
    type: String,
  })
  subscriberId: string;
}
