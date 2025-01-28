import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExternalApiAccessible, UserSession } from '@novu/application-generic';
import { DirectionEnum, UserSessionData } from '@novu/shared';
import { ApiCommonResponses } from '../shared/framework/response.decorator';

import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { ListSubscribersCommand } from './usecases/list-subscribers/list-subscribers.command';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { ListSubscribersQueryDto } from './dtos/list-subscribers-query.dto';
import { ListSubscribersResponseDto } from './dtos';
import { SdkGroupName, SdkMethodName } from '../shared/framework/swagger/sdk.decorators';

@Controller({ path: '/subscribers', version: '2' })
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Subscribers')
@SdkGroupName('Subscribers')
@ApiCommonResponses()
export class SubscribersController {
  constructor(private listSubscribersUsecase: ListSubscribersUseCase) {}

  @Get('')
  @UserAuthentication()
  @ExternalApiAccessible()
  @SdkMethodName('search')
  @ApiOperation({ summary: 'Search for subscribers' })
  @ApiResponse({
    status: 200,
    description: 'List of subscribers retrieved successfully.',
    type: ListSubscribersResponseDto,
  })
  async searchSubscribers(
    @UserSession() user: UserSessionData,
    @Query() query: ListSubscribersQueryDto
  ): Promise<ListSubscribersResponseDto> {
    return await this.listSubscribersUsecase.execute(
      ListSubscribersCommand.create({
        user,
        limit: Number(query.limit || '10'),
        after: query.after,
        before: query.before,
        orderDirection: query.orderDirection || DirectionEnum.DESC,
        orderBy: query.orderBy || 'createdAt',
        email: query.email,
        phone: query.phone,
        subscriberId: query.subscriberId,
        name: query.name,
      })
    );
  }
}
