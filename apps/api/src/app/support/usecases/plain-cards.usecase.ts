import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '@novu/dal';
import { PlainCardsCommand } from './plain-cards.command';

@Injectable()
export class PlainCardsUsecase {
  constructor(private organizationRepository: OrganizationRepository) {}
  async fetchUserOrganizations(command: PlainCardsCommand) {
    if (!command?.customer?.externalId) {
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
                componentText: {
                  text: 'This user is not yet registered on Novu',
                },
              },
            ],
          },
        ],
      };
    }
    const organizations = await this.organizationRepository.findUserActiveOrganizations(command?.customer?.externalId);

    const organizationsComponent = organizations?.map((organization) => {
      return {
        componentContainer: {
          containerContent: [
            {
              componentSpacer: {
                spacerSize: 'XS',
              },
            },
            {
              componentText: {
                text: 'Novu Org Id',
                textSize: 'S',
                textColor: 'MUTED',
              },
            },
            {
              componentSpacer: {
                spacerSize: 'XS',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: organization?._id,
                      textSize: 'S',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentCopyButton: {
                      copyButtonTooltipLabel: 'Copy Novu Org Id',
                      copyButtonValue: organization?._id,
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
              componentText: {
                text: 'Clerk Org Id',
                textSize: 'S',
                textColor: 'MUTED',
              },
            },
            {
              componentSpacer: {
                spacerSize: 'XS',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: organization?.externalId,
                      textSize: 'S',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentCopyButton: {
                      copyButtonTooltipLabel: 'Copy Clerk Org Id',
                      copyButtonValue: organization?.externalId,
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
              componentText: {
                text: 'Org Name',
                textSize: 'S',
                textColor: 'MUTED',
              },
            },
            {
              componentSpacer: {
                spacerSize: 'XS',
              },
            },
            {
              componentRow: {
                rowMainContent: [
                  {
                    componentText: {
                      text: organization?.name,
                      textSize: 'S',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentCopyButton: {
                      copyButtonTooltipLabel: 'Copy Org Name',
                      copyButtonValue: organization?.name,
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
                      text: 'Org Tier',
                      textSize: 'S',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentText: {
                      text: organization?.apiServiceLevel || 'NA',
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
                      text: 'Org Created At',
                      textSize: 'S',
                    },
                  },
                ],
                rowAsideContent: [
                  {
                    componentText: {
                      text: organization?.createdAt,
                    },
                  },
                ],
              },
            },
          ],
        },
      };
    });

    return {
      data: {},
      cards: [
        {
          key: 'plain-customer-details',
          components: organizationsComponent,
        },
      ],
    };
  }
}
