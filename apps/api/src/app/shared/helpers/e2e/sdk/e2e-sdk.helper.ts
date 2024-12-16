import { Novu } from '@novu/api';
import { NovuCore } from '@novu/api/core';
import { UserSession } from '@novu/testing';
import { expect } from 'chai';
import { ErrorDto, ValidationErrorDto } from '@novu/api/models/errors';

export function initNovuClassSdk(session: UserSession): Novu {
  // return new Novu({ apiKey: session.apiKey, serverURL: session.serverUrl, debugLogger: console }); if needed debugging
  return new Novu({ apiKey: session.apiKey, serverURL: session.serverUrl });
}
export function initNovuFunctionSdk(session: UserSession): NovuCore {
  return new NovuCore({ apiKey: session.apiKey, serverURL: session.serverUrl, debugLogger: console });
}

function isErrorDto(error: unknown): error is ErrorDto {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ErrorDto';
}
function isValidationErrorDto(error: unknown): error is ValidationErrorDto {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationErrorDto';
}

export function handleSdkError(error: unknown): ErrorDto {
  if (!isErrorDto(error)) {
    throw new Error(`Provided error is not an ErrorDto error found: ${JSON.stringify(error)}`);
  }
  expect(error.name).to.equal('ErrorDto');
  expect(error.ctx).to.be.ok;

  return error;
}
export function handleValidationErrorDto(error: unknown): ValidationErrorDto {
  if (!isValidationErrorDto(error)) {
    throw new Error(`Provided error is not an ErrorDto error found: ${JSON.stringify(error)}`);
  }
  expect(error.name).to.equal('ValidationErrorDto');
  expect(error.ctx).to.be.ok;

  return error;
}

type AsyncAction<U> = () => Promise<U>;

export async function expectSdkExceptionGeneric<U>(
  action: AsyncAction<U>
): Promise<{ error?: ErrorDto; successfulBody?: U }> {
  try {
    const response = await action();

    return { successfulBody: response };
  } catch (e) {
    return { error: handleSdkError(e) };
  }
}
