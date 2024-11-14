import { IMessagesPayload, IMessages } from './messages.interface';
import { WithHttp } from '../novu.interface';

const BASE_PATH = '/messages';

export class Messages extends WithHttp implements IMessages {
  async list(data?: IMessagesPayload) {
    const queryParams: Partial<IMessagesPayload> & {
      transactionId?: string[];
    } = {};
    data?.page && (queryParams.page = data?.page);
    data?.limit && (queryParams.limit = data?.limit);
    data?.subscriberId && (queryParams.subscriberId = data?.subscriberId);
    data?.channel && (queryParams.channel = data?.channel);
    data?.transactionIds && (queryParams.transactionId = data?.transactionIds);

    return await this.http.get(BASE_PATH, {
      params: queryParams,
    });
  }

  /**
   * Deletes a single message notification by messageId.
   *
   * @param {string} messageId - The MongoDB ID of the message to delete.
   */
  async deleteById(messageId: string) {
    return await this.http.delete(`${BASE_PATH}/${messageId}`);
  }

  /**
   * Deletes multiple message notifications by transactionId.
   *
   * @param {string} transactionId - The unique identifier of the event whose notifications will be deleted.
   */
  async deleteByTransactionId(transactionId: string) {
    return await this.http.delete(`${BASE_PATH}/transaction/${transactionId}`);
  }
}
