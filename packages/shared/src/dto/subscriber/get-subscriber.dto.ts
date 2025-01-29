export interface IGetSubscriberResponseDto {
  subscriberId: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  avatar?: string;

  createdAt: string;

  updatedAt: string;

  timezone?: string;

  locale?: string;

  _organizationId: string;

  _environmentId: string;

  _id: string;

  data?: Record<string, unknown>;
}
