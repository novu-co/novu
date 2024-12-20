import { Body, Controller, Post, UseGuards, Request, Response, RawBodyRequest } from '@nestjs/common';
import { UserAuthGuard, UserSession } from '@novu/application-generic';
import { UserSessionData } from '@novu/shared';
import { CreateSupportThreadDto } from './dto/create-thread.dto';
import { CreateSupportThreadCommand } from './usecases/create-thread.command';
import { PlainCardRequestDto } from './dto/plain-card.dto';
import { GetPlainCardsCommand } from './usecases/get-plain-cards.command';
import { FetchUserOrganizationsUsecase, CreateSupportThreadUsecase } from './usecases';
import { PlainCardsGuard } from './guards/plain-cards.guard';

@Controller('/support')
export class SupportController {
  constructor(
    private createSupportThreadUsecase: CreateSupportThreadUsecase,
    private fetchUserOrganizationsUsecase: FetchUserOrganizationsUsecase
  ) {}

  @UseGuards(PlainCardsGuard)
  @Post('user-organizations')
  async getUserOrganizations(@Body() body: PlainCardRequestDto) {
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
