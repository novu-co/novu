import { DirectionEnum } from '@novu/shared';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CursorBasedPaginatedCommand } from '@novu/application-generic';

export class ListSubscribersCommand extends CursorBasedPaginatedCommand {
  @IsEnum(DirectionEnum)
  @IsOptional()
  orderDirection: DirectionEnum = DirectionEnum.DESC;

  @IsEnum(['updatedAt', '_id'])
  @IsOptional()
  orderBy: 'updatedAt' | '_id' = '_id';

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  subscriberId?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
