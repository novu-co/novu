import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DigestTypeEnum, DigestUnitEnum } from '@novu/shared';
import { DigestTimedConfigDto } from './activities-response.dto';

export class DigestMetadataDto {
  @ApiPropertyOptional({ description: 'Optional key for the digest' })
  digestKey?: string;

  @ApiPropertyOptional({ description: 'Amount for the digest', type: Number })
  amount?: number;

  @ApiPropertyOptional({ description: 'Unit of the digest', enum: DigestUnitEnum })
  unit?: DigestUnitEnum;

  @ApiProperty({
    enum: [...Object.values(DigestTypeEnum)],
    enumName: 'DigestTypeEnum',
    description: 'The Digest Type',
    type: String,
  })
  type: DigestTypeEnum;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
    },
    description: 'Optional array of events associated with the digest, represented as key-value pairs',
  })
  events?: Record<string, unknown>[];

  // Properties for Regular Digest
  @ApiPropertyOptional({
    description: 'Regular digest: Indicates if backoff is enabled for the regular digest',
    type: Boolean,
  })
  backoff?: boolean;

  @ApiPropertyOptional({ description: 'Regular digest: Amount for backoff', type: Number })
  backoffAmount?: number;

  @ApiPropertyOptional({
    description: 'Regular digest: Unit for backoff',
    enum: [...Object.values(DigestUnitEnum)],
    enumName: 'DigestUnitEnum',
  })
  backoffUnit?: DigestUnitEnum;

  @ApiPropertyOptional({ description: 'Regular digest: Indicates if the digest should update', type: Boolean })
  updateMode?: boolean;

  // Properties for Timed Digest
  @ApiPropertyOptional({ description: 'Configuration for timed digest', type: DigestTimedConfigDto })
  timed?: DigestTimedConfigDto;
}
