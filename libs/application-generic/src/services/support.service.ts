import { Logger } from '@nestjs/common';
import { PlainClient, UpsertResult } from '@team-plain/typescript-sdk';

const LOG_CONTEXT = 'SupportService';

export class SupportService {
  private plainClient: PlainClient;
  constructor(private plainKey?: string | null) {}

  async initialize() {
    if (this.plainKey) {
      this.plainClient = new PlainClient({
        apiKey: this.plainKey,
      });
    } else {
      Logger.error(
        'Missing Plain API key: Unable to perform support operations. Please ensure the API key is set in the environment variables.',
        LOG_CONTEXT,
      );
    }
  }

  async upsertCustomer({ emailAddress, fullName }) {
    return await this.plainClient.upsertCustomer({
      identifier: {
        emailAddress,
      },
      onCreate: {
        email: {
          email: emailAddress,
          isVerified: true,
        },
        fullName,
      },
      onUpdate: {
        email: {
          email: emailAddress,
          isVerified: true,
        },

        fullName: {
          value: fullName,
        },
      },
    });
  }

  async createThread({ plainCustomerId, threadTitle, threadText }) {
    return await this.plainClient.createThread({
      title: threadTitle,
      customerIdentifier: {
        customerId: plainCustomerId,
      },
      components: [
        {
          componentText: {
            text: threadText,
          },
        },
      ],
    });
  }
}
