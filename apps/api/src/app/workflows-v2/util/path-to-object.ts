import _ from 'lodash';

/**
 * Converts an array of dot-notation paths into a nested object structure,
 * setting each path's value to the path itself.
 *
 * @param keys - Array of dot-notation paths
 * @returns Nested object with paths as values
 * @warning Entries without a namespace (no dots) will be ignored.
 * @example
 * convertToObject(['payload.old', 'payload.new', 'payload'])
 * // Returns: { payload: { old: 'payload.old', new: 'payload.new' } }
 * // Note: 'payload' entry is ignored as it has no namespace
 */
export function pathsToObject(
  keys: string[],
  { valuePrefix = '', valueSuffix = '' } = {}
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {};

  keys
    .filter((key) => key.includes('.'))
    .forEach((key) => {
      _.set(result, key, `${valuePrefix}${key}${valueSuffix}`);
    });

  return result;
}
