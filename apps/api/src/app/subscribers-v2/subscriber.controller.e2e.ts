import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { expect } from 'chai';
import { DirectionEnum } from '@novu/shared';

const v2Prefix = '/v2';
let session: UserSession;

describe('Subscriber Controller E2E API Testing #novu-v2', () => {
  beforeEach(async () => {
    session = new UserSession();
    await session.initialize({ noWidgetSession: true });
  });

  describe('List Subscriber Permutations', () => {
    it('should not return subscribers if not matching search params', async () => {
      await createSubscriberAndValidate('XYZ');
      await createSubscriberAndValidate('XYZ2');
      const subscribers = await getAllAndValidate({
        searchParams: { email: 'nonexistent@email.com' },
        expectedTotalResults: 0,
        expectedArraySize: 0,
      });
      expect(subscribers).to.be.empty;
    });

    it('should return results without any filter params', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);
      await getAllAndValidate({
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 10,
      });
    });

    it('should page subscribers without overlap using cursors', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const firstPage = await getListSubscribers({
        limit: 5,
      });

      const secondPage = await getListSubscribers({
        after: firstPage.next,
        limit: 5,
      });

      const idsDeduplicated = buildIdSet(firstPage.subscribers, secondPage.subscribers);
      expect(idsDeduplicated.size).to.be.equal(10);
    });
  });

  describe('List Subscriber Search Filters', () => {
    it('should find subscriber by email', async () => {
      const uuid = generateUUID();
      await createSubscriberAndValidate(uuid);

      const subscribers = await getAllAndValidate({
        searchParams: { email: `test-${uuid}@subscriber.com` },
        expectedTotalResults: 1,
        expectedArraySize: 1,
      });

      expect(subscribers[0].email).to.contain(uuid);
    });

    it('should find subscriber by phone', async () => {
      const uuid = generateUUID();
      await createSubscriberAndValidate(uuid);

      const subscribers = await getAllAndValidate({
        searchParams: { phone: '1234567' },
        expectedTotalResults: 0,
        expectedArraySize: 0,
      });

      const subscribers2 = await getAllAndValidate({
        searchParams: { phone: '+1234567890' },
        expectedTotalResults: 1,
        expectedArraySize: 1,
      });

      expect(subscribers2[0].phone).to.equal('+1234567890');
    });

    it('should find subscriber by full name', async () => {
      const uuid = generateUUID();
      await createSubscriberAndValidate(uuid);

      const subscribers = await getAllAndValidate({
        searchParams: { name: `Test ${uuid} Subscriber` },
        expectedTotalResults: 1,
        expectedArraySize: 1,
      });

      expect(subscribers[0].firstName).to.equal(`Test ${uuid}`);
      expect(subscribers[0].lastName).to.equal('Subscriber');
    });

    it('should find subscriber by subscriberId', async () => {
      const uuid = generateUUID();
      await createSubscriberAndValidate(uuid);

      const subscribers = await getAllAndValidate({
        searchParams: { subscriberId: `test-subscriber-${uuid}` },
        expectedTotalResults: 1,
        expectedArraySize: 1,
      });

      expect(subscribers[0].subscriberId).to.equal(`test-subscriber-${uuid}`);
    });
  });

  describe('List Subscriber Cursor Pagination', () => {
    it('should paginate forward using after cursor', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const firstPage = await getListSubscribers({
        limit: 5,
      });

      const secondPage = await getListSubscribers({
        after: firstPage.next,
        limit: 5,
      });

      expect(firstPage.subscribers).to.have.lengthOf(5);
      expect(secondPage.subscribers).to.have.lengthOf(5);
      expect(firstPage.next).to.exist;
      expect(secondPage.previous).to.exist;

      const idsDeduplicated = buildIdSet(firstPage.subscribers, secondPage.subscribers);
      expect(idsDeduplicated.size).to.equal(10);
    });

    it('should paginate backward using before cursor', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const firstPage = await getListSubscribers({
        limit: 5,
      });

      const secondPage = await getListSubscribers({
        after: firstPage.next,
        limit: 5,
      });

      const previousPage = await getListSubscribers({
        before: secondPage.previous,
        limit: 5,
      });

      expect(previousPage.subscribers).to.have.lengthOf(5);
      expect(previousPage.next).to.exist;
      expect(previousPage.subscribers).to.deep.equal(firstPage.subscribers);
    });

    it('should handle pagination with limit=1', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const firstPage = await getListSubscribers({
        limit: 1,
      });

      expect(firstPage.subscribers).to.have.lengthOf(1);
      expect(firstPage.next).to.exist;
      expect(firstPage.previous).to.not.exist;
    });
  });

  describe('List Subscriber Sorting', () => {
    it('should sort subscribers by _id in ascending order', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const response = await getListSubscribers({
        orderBy: '_id',
        orderDirection: DirectionEnum.ASC,
        limit: 10,
      });

      const ids = response.subscribers.map((sub) => sub._id);
      const sortedIds = [...ids].sort((a, b) => a.localeCompare(b));
      expect(ids).to.deep.equal(sortedIds);
    });

    it('should sort subscribers by _id in descending order', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const response = await getListSubscribers({
        orderBy: '_id',
        orderDirection: DirectionEnum.DESC,
        limit: 10,
      });

      const ids = response.subscribers.map((sub) => sub._id);
      const sortedIds = [...ids].sort((a, b) => b.localeCompare(a));
      expect(ids).to.deep.equal(sortedIds);
    });

    it('should maintain sort order across pages', async () => {
      const uuid = generateUUID();
      await createSubscribers(uuid, 10);

      const firstPage = await getListSubscribers({
        orderBy: '_id',
        orderDirection: DirectionEnum.DESC,
        limit: 5,
      });

      const secondPage = await getListSubscribers({
        orderBy: '_id',
        orderDirection: DirectionEnum.DESC,
        after: firstPage.next,
        limit: 5,
      });

      const allIds = [...firstPage.subscribers.map((sub) => sub._id), ...secondPage.subscribers.map((sub) => sub._id)];
      const sortedIds = [...allIds].sort((a, b) => b.localeCompare(a));
      expect(allIds).to.deep.equal(sortedIds);
    });
  });
});

async function createSubscriberAndValidate(nameSuffix: string = '') {
  const createSubscriberDto = {
    subscriberId: `test-subscriber-${nameSuffix}`,
    firstName: `Test ${nameSuffix}`,
    lastName: 'Subscriber',
    email: `test-${nameSuffix}@subscriber.com`,
    phone: '+1234567890',
  };

  const res = await session.testAgent.post(`/v1/subscribers`).send(createSubscriberDto);
  expect(res.status).to.equal(201);

  const subscriber = res.body.data;
  validateCreateSubscriberResponse(subscriber, createSubscriberDto);

  return subscriber;
}

async function createSubscribers(uuid: string, numberOfSubscribers: number) {
  for (let i = 0; i < numberOfSubscribers; i += 1) {
    await createSubscriberAndValidate(`${uuid}-${i}`);
  }
}

interface IListSubscribersQuery {
  email?: string;
  phone?: string;
  name?: string;
  subscriberId?: string;
  after?: string;
  before?: string;
  limit?: number;
  orderBy?: string;
  orderDirection?: DirectionEnum;
}

async function getListSubscribers(params: IListSubscribersQuery = {}) {
  const res = await session.testAgent.get(`${v2Prefix}/subscribers`).query(params);
  expect(res.status).to.equal(200);

  return res.body.data;
}

interface IAllAndValidate {
  msgPrefix?: string;
  searchParams?: IListSubscribersQuery;
  limit?: number;
  expectedTotalResults: number;
  expectedArraySize: number;
}

async function getAllAndValidate({
  msgPrefix = '',
  searchParams = {},
  limit = 15,
  expectedTotalResults,
  expectedArraySize,
}: IAllAndValidate) {
  const listResponse = await getListSubscribers({
    ...searchParams,
    limit,
  });
  const summary = buildLogMsg(
    {
      msgPrefix,
      searchParams,
      expectedTotalResults,
      expectedArraySize,
    },
    listResponse
  );

  expect(listResponse.subscribers).to.be.an('array', summary);
  expect(listResponse.subscribers).lengthOf(expectedArraySize, `subscribers length ${summary}`);

  return listResponse.subscribers;
}

function buildLogMsg(params: IAllAndValidate, listResponse: any): string {
  return `Log - msgPrefix: ${params.msgPrefix}, 
  searchParams: ${JSON.stringify(params.searchParams || 'Not specified', null, 2)}, 
  expectedTotalResults: ${params.expectedTotalResults ?? 'Not specified'}, 
  expectedArraySize: ${params.expectedArraySize ?? 'Not specified'}
  response: 
  ${JSON.stringify(listResponse || 'Not specified', null, 2)}`;
}

function buildIdSet(listResponse1: any[], listResponse2: any[]) {
  return new Set([...extractIDs(listResponse1), ...extractIDs(listResponse2)]);
}

function extractIDs(subscribers: any[]) {
  return subscribers.map((subscriber) => subscriber._id);
}

function generateUUID(): string {
  const randomHex = () => randomBytes(2).toString('hex');

  return `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
}

function validateCreateSubscriberResponse(subscriber: any, createDto: any) {
  expect(subscriber).to.be.ok;
  expect(subscriber._id).to.be.ok;
  expect(subscriber.subscriberId).to.equal(createDto.subscriberId);
  expect(subscriber.firstName).to.equal(createDto.firstName);
  expect(subscriber.lastName).to.equal(createDto.lastName);
  expect(subscriber.email).to.equal(createDto.email);
  expect(subscriber.phone).to.equal(createDto.phone);
}
