import _ = require('lodash');

export function findMissingKeys(requiredRecord: object, actualRecord: object) {
  const requiredKeys = collectKeys(requiredRecord);
  const actualKeys = collectKeys(actualRecord);

  return _.difference(requiredKeys, actualKeys);
}

export function collectKeys(obj, prefix = '') {
  return _.reduce(
    obj,
    (result, value, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (_.isObject(value) && !_.isArray(value)) {
        result.push(...collectKeys(value, newKey));
      } else {
        result.push(newKey);
      }

      return result;
    },
    []
  );
}
