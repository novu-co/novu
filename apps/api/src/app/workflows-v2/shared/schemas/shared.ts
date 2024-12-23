import { Targets, Options } from 'zod-to-json-schema';

export const defaultOptions: Partial<Options<Targets>> = {
  $refStrategy: 'none',
};
