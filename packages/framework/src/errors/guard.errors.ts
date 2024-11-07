import { ErrorCodeEnum } from '../constants';
import { FrameworkError } from './base.errors';
import { PlatformError } from './platform.errors';

/**
 * Check if the object is a native error.
 *
 * This method relies on `Object.prototype.toString()` behavior. It is possible to obtain
 * an incorrect result when the object argument manipulates the `@@toStringTag` property.
 *
 * @param object - The object to check.
 * @returns `true` if the object is a native error, `false` otherwise.
 */
export const isNativeError = (object: unknown): object is Error => {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(object);

  return proto?.constructor?.name.endsWith('Error') ?? false;
};

/**
 * Check if the error is a `FrameworkError`.
 *
 * A `FrameworkError` is an error thrown by the Framework.
 *
 * @param error - The error to check.
 * @returns `true` if the error is a `FrameworkError`, `false` otherwise.
 */
export const isFrameworkError = (error: unknown): error is FrameworkError => {
  return Object.values(ErrorCodeEnum).includes((error as FrameworkError)?.code as ErrorCodeEnum);
};

/**
 * Check if the error is a `PlatformError`.
 *
 * A `PlatformError` is a server error that is thrown by the Platform,
 * where the Bridge application acts as a proxy to the Platform.
 *
 * @param error - The error to check.
 * @returns `true` if the error is a `PlatformError`, `false` otherwise.
 */
export const isPlatformError = (error: unknown): error is PlatformError => {
  return (
    !isFrameworkError(error) &&
    typeof (error as PlatformError).statusCode === 'number' &&
    (error as PlatformError).statusCode >= 400 &&
    (error as PlatformError).statusCode < 500
  );
};
