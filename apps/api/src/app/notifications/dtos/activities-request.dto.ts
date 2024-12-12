import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChannelTypeEnum } from '@novu/shared';
import { IsOptional } from 'class-validator';

export class ActivitiesRequestDto {
  @ApiPropertyOptional({
    enum: ChannelTypeEnum,
    isArray: true,
  })
  channels?: ChannelTypeEnum[] | ChannelTypeEnum;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
  })
  templates?: string[] | string;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
  })
  emails?: string | string[];

  @ApiPropertyOptional({
    type: String,
    deprecated: true,
  })
  search?: string;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
  })
  subscriberIds?: string | string[];

  @ApiPropertyOptional({
    type: Number,
    required: false,
  })
  page?: number = 0;

  @ApiPropertyOptional({
    type: String,
    required: false,
  })
  transactionId?: string;

  @ApiPropertyOptional({
    type: String,
    required: false,
  })
  @IsOptional()
  after?: string;

  @ApiPropertyOptional({
    type: String,
    required: false,
  })
  @IsOptional()
  before?: string;
}
