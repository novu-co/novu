import { ApiProperty } from '@nestjs/swagger';

export class PlainCutomer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  externalId?: string;

  @ApiProperty()
  email?: string;
}

export class PlainTenant {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  externalId?: string;
}

export class PlainThread {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  externalId?: string;
}

export class PlainCardRequestDto {
  @ApiProperty()
  cardKeys?: string[];

  @ApiProperty()
  customer?: PlainCutomer | null;

  @ApiProperty()
  tenant?: PlainTenant | null;

  @ApiProperty()
  thread?: PlainThread | null;

  @ApiProperty()
  timestamp: string;
}
