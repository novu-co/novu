import { ClassSerializerInterceptor, Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExternalApiAccessible, UserSession } from '@novu/application-generic';
import {
  DirectionEnum,
  IGetSubscriberResponseDto,
  IListSubscribersRequestDto,
  IListSubscribersResponseDto,
  UserSessionData,
} from '@novu/shared';
import { ApiCommonResponses } from '../shared/framework/response.decorator';
import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { ListSubscribersCommand } from './usecases/list-subscribers/list-subscribers.command';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { GetSubscriber } from './usecases/get-subscriber/get-subscriber.usecase';
import { GetSubscriberCommand } from './usecases/get-subscriber/get-subscriber.command';

@Controller({ path: '/subscribers', version: '2' })
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Subscribers')
@ApiCommonResponses()
export class SubscriberController {
  constructor(
    private listSubscribersUsecase: ListSubscribersUseCase,
    private getSubscriberUsecase: GetSubscriber
  ) {}

  @Get('')
  @UserAuthentication()
  async getSubscribers(
    @UserSession() user: UserSessionData,
    @Query() query: IListSubscribersRequestDto
  ): Promise<IListSubscribersResponseDto> {
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

  @Get('/:subscriberId')
  @UserAuthentication()
  @ExternalApiAccessible()
  @ApiOperation({
    summary: 'Get subscriber',
    description: 'Get subscriber by your internal id used to identify the subscriber',
  })
  async getSubscriber(
    @UserSession() user: UserSessionData,
    @Param('subscriberId') subscriberId: string
  ): Promise<IGetSubscriberResponseDto> {
    return await this.getSubscriberUsecase.execute(
      GetSubscriberCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        subscriberId,
      })
    );
  }
}
