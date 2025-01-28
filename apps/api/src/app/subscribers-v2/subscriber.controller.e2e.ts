import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { expect } from 'chai';
import { DirectionEnum } from '@novu/shared';

const v2Prefix = '/v2';
let session: UserSession;

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

  it('should return results without any search params', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);
    await getAllAndValidate({
      limit: 15,
      expectedTotalResults: 10,
      expectedArraySize: 10,
    });
  });

  it('should page subscribers without overlap using cursors', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);

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
      searchParams: { email: `test-${uuid}@subscriber` },
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
      expectedTotalResults: 1,
      expectedArraySize: 1,
    });

    expect(subscribers[0].phone).to.equal('+1234567890');
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
    await create10Subscribers(uuid);

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
    await create10Subscribers(uuid);

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
    await create10Subscribers(uuid);

    const firstPage = await getListSubscribers({
      limit: 1,
    });

    expect(firstPage.subscribers).to.have.lengthOf(1);
    expect(firstPage.next).to.exist;
    expect(firstPage.previous).to.not.exist;
  });

  it('should return empty array when no more results after cursor', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);

    const allResults = await getListSubscribers({
      limit: 10,
    });

    const nextPage = await getListSubscribers({
      after: allResults.next,
      limit: 5,
    });

    expect(nextPage.subscribers).to.have.lengthOf(0);
    expect(nextPage.next).to.not.exist;
    expect(nextPage.previous).to.exist;
  });
});

describe('List Subscriber Sorting', () => {
  it('should sort subscribers by createdAt in ascending order', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);

    const response = await getListSubscribers({
      sortBy: 'createdAt',
      sortDirection: DirectionEnum.ASC,
      limit: 10,
    });

    const timestamps = response.subscribers.map((sub) => new Date(sub.createdAt).getTime());
    const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
    expect(timestamps).to.deep.equal(sortedTimestamps);
  });

  it('should sort subscribers by createdAt in descending order', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);

    const response = await getListSubscribers({
      sortBy: 'createdAt',
      sortDirection: DirectionEnum.DESC,
      limit: 10,
    });

    const timestamps = response.subscribers.map((sub) => new Date(sub.createdAt).getTime());
    const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).to.deep.equal(sortedTimestamps);
  });

  it('should sort subscribers by subscriberId', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);

    const response = await getListSubscribers({
      sortBy: 'subscriberId',
      sortDirection: DirectionEnum.ASC,
      limit: 10,
    });

    const ids = response.subscribers.map((sub) => sub.subscriberId);
    const sortedIds = [...ids].sort();
    expect(ids).to.deep.equal(sortedIds);
  });

  it('should maintain sort order across pages', async () => {
    const uuid = generateUUID();
    await create10Subscribers(uuid);

    const firstPage = await getListSubscribers({
      sortBy: 'createdAt',
      sortDirection: DirectionEnum.ASC,
      limit: 5,
    });

    const secondPage = await getListSubscribers({
      sortBy: 'createdAt',
      sortDirection: DirectionEnum.ASC,
      after: firstPage.next,
      limit: 5,
    });

    const allTimestamps = [
      ...firstPage.subscribers.map((sub) => new Date(sub.createdAt).getTime()),
      ...secondPage.subscribers.map((sub) => new Date(sub.createdAt).getTime()),
    ];

    const sortedTimestamps = [...allTimestamps].sort((a, b) => a - b);
    expect(allTimestamps).to.deep.equal(sortedTimestamps);
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

async function create10Subscribers(uuid: string) {
  for (let i = 0; i < 10; i += 1) {
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
  sortBy?: string;
  sortDirection?: DirectionEnum;
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
