import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserAuthGuard, UserSession } from '@novu/application-generic';
import { UserRepository } from '@novu/dal';
import { UserSessionData } from '@novu/shared';
import { CreateSupportThreadDto } from './dto/create-thread.dto';
import { CreateSupportThreadUsecase } from './usecases/create-thread.usecase';
import { CreateSupportThreadCommand } from './usecases/create-thread.command';

@Controller('/support')
export class SupportController {
  constructor(
    private readonly userRepository: UserRepository,
    private createSupportThreadUsecase: CreateSupportThreadUsecase
  ) {}

  @Post('plain/cards')
  async getPlainCards() {
    return {
      data: {},

      cards: [
        {
          key: 'plain-customer-details',
          components: [
            {
              componentSpacer: {
                spacerSize: 'S',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: 'Registered at',
                      textColor: 'MUTED',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentText: {
                      text: '7/18/2024, 1:00 PM',
                    },
                  },
                ],
              },
            },
            {
              componentSpacer: {
                spacerSize: 'M',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: 'Last signed in',
                      textColor: 'MUTED',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentText: {
                      text: '10/20/2024, 12:57 PM',
                    },
                  },
                ],
              },
            },
            {
              componentSpacer: {
                spacerSize: 'M',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: 'Last device used',
                      textColor: 'MUTED',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentText: {
                      text: 'iPhone 13 🍎',
                    },
                  },
                ],
              },
            },
            {
              componentSpacer: {
                spacerSize: 'M',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: 'Marketing preferences',
                      textColor: 'MUTED',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentText: {
                      text: 'Opted out 🙅',
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
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
