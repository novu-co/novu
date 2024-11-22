import { type ApiRateLimitServiceMaximumEnvVarFormat } from './service.types';
import { type ApiRateLimitAlgorithmEnvVarFormat } from './algorithm.types';
import { type ApiRateLimitCostEnvVarFormat } from './cost.types';

/**
 * The format of all environment variables used to configure rate limiting.
 */
export type ApiRateLimitEnvVarFormat =
  | ApiRateLimitCostEnvVarFormat
  | ApiRateLimitAlgorithmEnvVarFormat
  | ApiRateLimitServiceMaximumEnvVarFormat;
