import { Body, Controller, Post, UseGuards, Request, Response, RawBodyRequest } from '@nestjs/common';
import { UserAuthGuard, UserSession } from '@novu/application-generic';
import { UserSessionData } from '@novu/shared';
import crypto from 'node:crypto';
import { CreateSupportThreadDto } from './dto/create-thread.dto';
import { CreateSupportThreadCommand } from './usecases/create-thread.command';
import { PlainCardRequestDto } from './dto/plain-card.dto';
import { GetPlainCardsCommand } from './usecases/get-plain-cards.command';
import { FetchUserOrganizationsUsecase, CreateSupportThreadUsecase } from './usecases';

@Controller('/support')
export class SupportController {
  constructor(
    private createSupportThreadUsecase: CreateSupportThreadUsecase,
    private fetchUserOrganizationsUsecase: FetchUserOrganizationsUsecase
  ) {}

  @Post('user-organizations')
  async getUserOrganizations(
    @Body() body: PlainCardRequestDto,
    @Request() request: RawBodyRequest<Request>,
    @Response() response
  ) {
    const requestBody = JSON.stringify(request.body);

    const incomingSignature = request.headers['Plain-Request-Signature'];
    const expectedSignature = crypto.createHmac('sha-256', '<HMAC SECRET>').update(requestBody).digest('hex');

    if (incomingSignature !== expectedSignature) {
      return response.status(403).send('Forbidden');
    }

    return this.fetchUserOrganizationsUsecase.execute(GetPlainCardsCommand.create({ ...body }));
  }

  @UseGuards(UserAuthGuard)
  @Post('create-thread')
  async createThread(@Body() body: CreateSupportThreadDto, @UserSession() user: UserSessionData) {
    return this.createSupportThreadUsecase.execute(
      CreateSupportThreadCommand.create({
        text: body.text,
        email: user.email as string,
        firstName: user.firstName as string,
        lastName: user.lastName as string,
        userId: user._id as string,
      })
    );
  }
}
