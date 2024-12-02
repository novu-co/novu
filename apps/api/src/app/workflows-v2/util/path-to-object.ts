import _ from 'lodash';

/**
 * Converts an array of dot-notation paths into a nested object structure,
 * setting each path's value to the path itself.
 *
 * @param keys - Array of dot-notation paths
 * @returns Nested object with paths as values
 * @example
 * convertToObject(['user.name', 'user.age'])
 * // Returns: { user: { name: 'user.name', age: 'user.age' } }
 */
export function pathsToObject(keys: string[], { valuePrefix = '', valueSuffix = '' } = {}): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  keys.forEach((key) => {
    _.set(result, key, `${valuePrefix}${key}${valueSuffix}`);
  });

  return result;
}
