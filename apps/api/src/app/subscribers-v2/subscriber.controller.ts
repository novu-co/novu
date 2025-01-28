import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserSession } from '@novu/application-generic';
import { DirectionEnum, IListSubscribersRequestDto, IListSubscribersResponseDto, UserSessionData } from '@novu/shared';
import { ApiCommonResponses } from '../shared/framework/response.decorator';

import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { ListSubscribersCommand } from './usecases/list-subscribers/list-subscribers.command';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';

@Controller({ path: '/subscribers', version: '2' })
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Subscribers')
@ApiCommonResponses()
export class SubscriberController {
  constructor(private listSubscribersUsecase: ListSubscribersUseCase) {}

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
}
