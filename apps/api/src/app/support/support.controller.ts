import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserAuthGuard, UserSession } from '@novu/application-generic';
import { UserSessionData } from '@novu/shared';
import { CreateSupportThreadDto } from './dto/create-thread.dto';
import { CreateSupportThreadCommand } from './usecases/create-thread.command';
import { PlainCardRequestDto } from './dto/plain-card.dto';
import { FetchUserOrganizationsCommand } from './usecases/fetch-user-organizations/fetch-user-organizations.command';
import { FetchUserOrganizationsUsecase, CreateSupportThreadUsecase } from './usecases';

@Controller('/support')
export class SupportController {
  constructor(
    private createSupportThreadUsecase: CreateSupportThreadUsecase,
    private fetchUserOrganizationsUsecase: FetchUserOrganizationsUsecase
  ) {}

  @Post('plain/cards')
  async getUserOrganizations(@Body() body: PlainCardRequestDto) {
    return this.fetchUserOrganizationsUsecase.execute(FetchUserOrganizationsCommand.create({ ...body }));
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
