interface IBaseFields {
  subscriberId: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  avatar?: string;

  timezone?: string;

  locale?: string;

  data?: Record<string, unknown>;
}

export interface IPatchSubscriberRequestDto extends Partial<IBaseFields> {}
