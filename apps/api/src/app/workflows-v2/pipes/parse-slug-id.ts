import { BaseRepository } from '@novu/dal';
import { ShortIsPrefixEnum } from '@novu/shared';
import { isValidShortId } from '@novu/application-generic';
import { decodeBase62 } from '../../shared/helpers';

export type InternalId = string;
const INTERNAL_ID_LENGTH = 24;
const ENCODED_ID_LENGTH = 16;

function isWorkflowId(value: string) {
  return value.length < ENCODED_ID_LENGTH;
}

function isInternalId(value: string) {
  return BaseRepository.isInternalId(value) && value.length === INTERNAL_ID_LENGTH;
}

function lookoutForId(value: string): string | null {
  if (isInternalId(value)) {
    return value;
  }

  return null;
}

export function parseSlugId(value: string): InternalId {
  if (!value) {
    return value;
  }

  const validId = lookoutForId(value);
  // if contains only a internal id or a workflow id
  if (validId) {
    return validId;
  }

  // result is emhJxofizJJEcIN3 / h2khu3
  const prefixedId = extractPrefixedId(value);

  // only case is that this is a workflow id
  if (!prefixedId) {
    return value;
  }

  if (isValidShortId(prefixedId, 6)) {
    return prefixedId;
  }

  let decodedValue: string;
  try {
    decodedValue = decodeBase62(prefixedId);
  } catch (error) {
    return value;
  }
  const validDecodedId = lookoutForId(decodedValue);
  if (validDecodedId) {
    return validDecodedId;
  }

  return value;
}

function extractPrefixedId(value: string): string | null {
  const prefixes = Object.values(ShortIsPrefixEnum);
  let id: string | null = null;
  for (const prefix of prefixes) {
    const parts = value.split(`_${prefix}`);
    if (parts.length > 1) {
      id = parts[parts.length - 1];
      break;
    }
  }

  return id;
}
