import { testServer } from '@novu/testing';
import sinon from 'sinon';
import chai from 'chai';

import { bootstrap } from '../src/bootstrap';

console.log('Testing e2e...');

before(async () => {
  /**
   * disable truncating for better error messages - https://www.chaijs.com/guide/styles/#configtruncatethreshold
   */
  chai.config.truncateThreshold = 0;
  await testServer.create(await bootstrap());
});

after(async () => {
  await testServer.teardown();
});

afterEach(() => {
  sinon.restore();
});
