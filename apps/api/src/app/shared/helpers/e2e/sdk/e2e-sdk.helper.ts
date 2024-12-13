import { Novu } from '@novu/api';
import { NovuCore } from '@novu/api/core';
import { UserSession } from '@novu/testing';
import { SDKError } from '@novu/api/models/errors/sdkerror';
import { expect } from 'chai';

export function initNovuClassSdk(session: UserSession): Novu {
  return new Novu({ apiKey: session.apiKey, serverURL: session.serverUrl, debugLogger: console });
}
export function initNovuFunctionSdk(session: UserSession): NovuCore {
  return new NovuCore({ apiKey: session.apiKey, serverURL: session.serverUrl, debugLogger: console });
}

function isSDKError(error: unknown): error is SDKError {
  return typeof error === 'object' && error !== null && 'name' in error && 'body' in error;
}

export function handleSdkError(error: unknown): { error: SDKError; parsedBody: any } {
  if (!isSDKError(error)) {
    throw new Error('Provided error is not an SDKError');
  }
  expect(error.name).to.equal('SDKError');
  expect(error.body).to.be.ok;
  expect(typeof error.body).to.be.eq('string');
  const errorBody = error.body ? JSON.parse(error.body) : 'No Body';

  return { error, parsedBody: errorBody };
}

type AsyncAction<U> = () => Promise<U>;

export async function expectSdkExceptionGeneric<U>(
  action: AsyncAction<U>
): Promise<{ error?: SDKError; parsedBody?: any; successfulBody?: U }> {
  try {
    const response = await action();

    return { successfulBody: response };
  } catch (e) {
    return handleSdkError(e);
  }
}
