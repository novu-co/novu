import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { HubspotIdentifyFormCommand } from './hubspot-identify-form.command';

const LOG_CONTEXT = 'HubspotIdentifyFormUsecase';

@Injectable()
export class HubspotIdentifyFormUsecase {
  private readonly hubspotPortalId = '44416662';
  private readonly hubspotFormId = 'fc39aa98-4285-4322-9514-52da978baae8';

  constructor(private httpService: HttpService) {}

  async execute(command: HubspotIdentifyFormCommand) {
    try {
      const hubspotSubmitUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${this.hubspotPortalId}/${this.hubspotFormId}`;

      const hubspotData = {
        fields: [
          { name: 'email', value: command.email },
          { name: 'lastname', value: command.lastName || 'Unknown' },
          { name: 'firstname', value: command.firstName || 'Unknown' },
          { name: 'app_organizationid', value: command.organizationId },
        ],
        context: {
          hutk: command.hubspotContext,
          pageUri: command.pageUri,
          pageName: command.pageName,
        },
      };

      await this.httpService.post(hubspotSubmitUrl, hubspotData);
    } catch (error) {
      if (error instanceof AxiosError) {
        Logger.error(
          `Failed to submit to Hubspot message=${error.message}, status=${error.status}`,
          {
            organizationId: command.organizationId,
            response: error.response?.data,
          },
          LOG_CONTEXT
        );
      } else {
        throw error;
      }
    }
  }
}
