import { customAlphabet } from 'nanoid';

export const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

const nanoid = customAlphabet(ALPHABET);

export function shortId(size = 4) {
  return nanoid(size);
}

const VALID_CHARS = new Set(ALPHABET);
export function isValidShortId(str: string, size: number): boolean {
  if (size && str.length !== size) {
    return false;
  }

  for (const char of str) {
    if (!VALID_CHARS.has(char)) {
      return false;
    }
  }

  return true;
}
