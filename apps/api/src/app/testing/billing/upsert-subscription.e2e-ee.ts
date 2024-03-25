import * as sinon from 'sinon';
import { OrganizationRepository } from '@novu/dal';
import { expect } from 'chai';
import { ApiServiceLevelEnum } from '@novu/shared';
import { StripeBillingIntervalEnum, StripeUsageTypeEnum } from '@novu/ee-billing/src/stripe/types';

describe('UpsertSubscription', () => {
  const eeBilling = require('@novu/ee-billing');
  if (!eeBilling) {
    throw new Error('ee-billing does not exist');
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { UpsertSubscription, GetPrices, UpsertSubscriptionCommand } = eeBilling;

  const stripeStub = {
    subscriptions: {
      create: () => {},
      update: () => {},
      del: () => {},
    },
  };
  let updateSubscriptionStub: sinon.SinonStub;
  let createSubscriptionStub: sinon.SinonStub;
  let deleteSubscriptionStub: sinon.SinonStub;

  let getPricesStub: sinon.SinonStub;
  const repo = new OrganizationRepository();
  let updateOrgStub: sinon.SinonStub;

  const mockCustomerBase = {
    id: 'customer_id',
    deleted: false,
    metadata: {
      organizationId: 'organization_id',
    },
    subscriptions: {
      data: [
        {
          id: 'subscription_id',
          items: {
            data: [
              {
                id: 'item_id_usage_notifications',
                price: { recurring: { usage_type: StripeUsageTypeEnum.METERED } },
              },
              { id: 'item_id_flat', price: { recurring: { usage_type: StripeUsageTypeEnum.LICENSED } } },
            ],
          },
        },
      ],
    },
  };

  beforeEach(() => {
    getPricesStub = sinon.stub(GetPrices.prototype, 'execute').resolves({
      metered: [
        {
          id: 'price_id_metered',
        },
      ],
      licensed: [
        {
          id: 'price_id_licensed',
        },
      ],
    } as any);
    updateOrgStub = sinon.stub(repo, 'update').resolves({ matched: 1, modified: 1 });
    createSubscriptionStub = sinon.stub(stripeStub.subscriptions, 'create');
    updateSubscriptionStub = sinon.stub(stripeStub.subscriptions, 'update');
    deleteSubscriptionStub = sinon.stub(stripeStub.subscriptions, 'del');
  });

  afterEach(() => {
    getPricesStub.reset();
    updateOrgStub.reset();
    createSubscriptionStub.reset();
    updateSubscriptionStub.reset();
    deleteSubscriptionStub.reset();
  });

  const createUseCase = () => {
    const useCase = new UpsertSubscription(stripeStub as any, repo, { execute: getPricesStub } as any);

    return useCase;
  };

  describe('Subscription upserting', () => {
    describe('ZERO active subscriptions', () => {
      const mockCustomerNoSubscriptions = {
        ...mockCustomerBase,
        subscriptions: { data: [] },
      };

      it('should create a single subscription with monthly prices when billingInterval is month', async () => {
        const useCase = createUseCase();

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerNoSubscriptions as any,
            apiServiceLevel: ApiServiceLevelEnum.BUSINESS,
            billingInterval: StripeBillingIntervalEnum.MONTH,
          })
        );

        expect(createSubscriptionStub.lastCall.args).to.deep.equal([
          {
            customer: 'customer_id',
            items: [
              {
                price: 'price_id_metered',
              },
              {
                price: 'price_id_licensed',
              },
            ],
          },
        ]);
      });

      it('should create two subscriptions, one with monthly prices and one with annual prices when billingInterval is year', async () => {
        const useCase = createUseCase();

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerNoSubscriptions as any,
            apiServiceLevel: ApiServiceLevelEnum.BUSINESS,
            billingInterval: StripeBillingIntervalEnum.YEAR,
          })
        );

        expect(createSubscriptionStub.callCount).to.equal(2);
        expect(createSubscriptionStub.getCalls().flatMap((call) => call.args)).to.deep.equal([
          {
            customer: 'customer_id',
            items: [
              {
                price: 'price_id_licensed',
              },
            ],
          },
          {
            customer: 'customer_id',
            items: [
              {
                price: 'price_id_metered',
              },
            ],
          },
        ]);
      });
    });

    describe('ONE active subscription', () => {
      const mockCustomerOneSubscription = {
        ...mockCustomerBase,
        subscriptions: {
          data: [
            {
              id: 'subscription_id',
              items: {
                data: [
                  {
                    id: 'item_id_usage_notifications',
                    price: { recurring: { usage_type: StripeUsageTypeEnum.METERED } },
                  },
                  { id: 'item_id_flat', price: { recurring: { usage_type: StripeUsageTypeEnum.LICENSED } } },
                ],
              },
            },
          ],
        },
      };

      it('should update the existing subscription if the customer has one subscription and billingInterval is month', async () => {
        const useCase = createUseCase();

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerOneSubscription as any,
            apiServiceLevel: ApiServiceLevelEnum.FREE,
            billingInterval: StripeBillingIntervalEnum.MONTH,
          })
        );

        expect(updateSubscriptionStub.lastCall.args).to.deep.equal([
          'subscription_id',
          {
            items: [
              {
                price: 'price_id_metered',
              },
              {
                price: 'price_id_licensed',
              },
            ],
          },
        ]);
      });

      it('should create a new annual subscription and update the existing subscription if the customer has one subscription and billingInterval is year', async () => {
        const useCase = createUseCase();

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerOneSubscription as any,
            apiServiceLevel: ApiServiceLevelEnum.FREE,
            billingInterval: StripeBillingIntervalEnum.YEAR,
          })
        );

        expect(createSubscriptionStub.lastCall.args).to.deep.equal([
          {
            customer: 'customer_id',
            items: [
              {
                price: 'price_id_licensed',
              },
            ],
          },
        ]);

        expect(updateSubscriptionStub.lastCall.args).to.deep.equal([
          'subscription_id',
          {
            items: [
              {
                price: 'price_id_metered',
              },
            ],
          },
        ]);
      });
    });

    describe('TWO active subscriptions', () => {
      const mockCustomerTwoSubscriptions = {
        ...mockCustomerBase,
        subscriptions: {
          data: [
            {
              id: 'subscription_id_1',
              items: {
                data: [{ id: 'item_id_flat', price: { recurring: { usage_type: StripeUsageTypeEnum.LICENSED } } }],
              },
            },
            {
              id: 'subscription_id_2',
              items: {
                data: [
                  {
                    id: 'item_id_usage_notifications',
                    price: { recurring: { usage_type: StripeUsageTypeEnum.METERED } },
                  },
                ],
              },
            },
          ],
        },
      };
      it('should delete the licensed subscription and update the metered subscription if the customer has two subscriptions and billingInterval is month', async () => {
        const useCase = createUseCase();

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerTwoSubscriptions as any,
            apiServiceLevel: ApiServiceLevelEnum.FREE,
            billingInterval: StripeBillingIntervalEnum.MONTH,
          })
        );

        expect(deleteSubscriptionStub.lastCall.args).to.deep.equal(['subscription_id_1', { prorate: true }]);

        expect(updateSubscriptionStub.lastCall.args).to.deep.equal([
          'subscription_id_2',
          {
            items: [
              {
                price: 'price_id_metered',
              },
              {
                price: 'price_id_licensed',
              },
            ],
          },
        ]);
      });

      it('should update the existing subscriptions if the customer has two subscriptions and billingInterval is year', async () => {
        const useCase = createUseCase();

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerTwoSubscriptions as any,
            apiServiceLevel: ApiServiceLevelEnum.FREE,
            billingInterval: StripeBillingIntervalEnum.YEAR,
          })
        );

        expect(updateSubscriptionStub.getCalls().map((call) => call.args)).to.deep.equal([
          [
            'subscription_id_1',
            {
              items: [
                {
                  price: 'price_id_licensed',
                },
              ],
            },
          ],
          [
            'subscription_id_2',
            {
              items: [
                {
                  price: 'price_id_metered',
                },
              ],
            },
          ],
        ]);
      });
    });

    describe('More than TWO active subscriptions', () => {
      it('should throw an error if the customer has more than two subscription', async () => {
        const useCase = createUseCase();
        const customer = { ...mockCustomerBase, subscriptions: { data: [{}, {}, {}] } };

        try {
          await useCase.execute(
            UpsertSubscriptionCommand.create({
              customer: customer as any,
              apiServiceLevel: ApiServiceLevelEnum.FREE,
              billingInterval: StripeBillingIntervalEnum.MONTH,
            })
          );
          throw new Error('Should not reach here');
        } catch (e) {
          expect(e.message).to.equal(`Customer with id: 'customer_id' has more than two subscriptions`);
        }
      });
    });

    it('should throw an error if the billing interval is not supported', async () => {
      const useCase = createUseCase();
      const customer = { ...mockCustomerBase, subscriptions: { data: [{}, {}] } };

      try {
        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: customer as any,
            apiServiceLevel: ApiServiceLevelEnum.FREE,
            billingInterval: 'invalid',
          })
        );
        throw new Error('Should not reach here');
      } catch (e) {
        expect(e.message).to.equal(`Invalid billing interval: 'invalid'`);
      }
    });

    describe('Organization entity update', () => {
      it('should update the organization with the new apiServiceLevel', async () => {
        const useCase = createUseCase();
        const customer = { ...mockCustomerBase, subscriptions: { data: [{}, {}] } };

        await useCase.execute(
          UpsertSubscriptionCommand.create({
            customer: mockCustomerBase as any,
            billingInterval: StripeBillingIntervalEnum.MONTH,
            apiServiceLevel: ApiServiceLevelEnum.BUSINESS,
          })
        );

        expect(updateOrgStub.lastCall.args).to.deep.equal([
          { _id: 'organization_id' },
          { apiServiceLevel: ApiServiceLevelEnum.BUSINESS },
        ]);
      });
    });
  });
});
