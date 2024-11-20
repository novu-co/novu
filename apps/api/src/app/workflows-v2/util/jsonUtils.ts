import _ from 'lodash';

export function flattenJson(obj?: Object, parentKey = '', result = {}) {
  if (!obj || typeof obj !== 'object' || _.isArray(obj)) {
    return result; // Return the result as is if obj is not a valid object
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !_.isArray(obj[key])) {
        flattenJson(obj[key], newKey, result);
      } else if (_.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          const arrayKey = `${newKey}[${index}]`;
          if (typeof item === 'object' && item !== null) {
            flattenJson(item, arrayKey, result);
          } else {
            // eslint-disable-next-line no-param-reassign
            result[arrayKey] = item;
          }
        });
      } else {
        // eslint-disable-next-line no-param-reassign
        result[newKey] = obj[key];
      }
    }
  }

  return result;
}
// Merging the JSON objects, arrays are concatenated
export function mergeObjects(json1: Record<string, unknown>, json2?: Record<string, unknown>) {
  if (!json2) {
    return json1;
  }
  if (!json1) {
    return json2;
  }

  return _.mergeWith(json1, json2, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue); // Accumulate arrays
    }
  });
}
type FlatJson = Record<string, unknown>;
type NestedJson = Record<string, unknown>;

export function flattenToNested(flatJson: FlatJson, delimiter: string = '.'): NestedJson {
  const nestedJson: NestedJson = {};

  for (const flatKey of Object.keys(flatJson)) {
    const keys = flatKey.split(delimiter);
    keys.reduce((accumulator, currentKey, index) => {
      if (index === keys.length - 1) {
        // eslint-disable-next-line no-param-reassign
        accumulator[currentKey] = flatJson[flatKey];
      } else if (!accumulator[currentKey]) {
        // eslint-disable-next-line no-param-reassign
        accumulator[currentKey] = {};
      }

      return accumulator[currentKey] as NestedJson;
    }, nestedJson);
  }

  return nestedJson;
}
