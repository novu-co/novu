import { type HealthIndicatorResult } from '@nestjs/terminus';

export interface IHealthIndicator {
  isHealthy(): Promise<HealthIndicatorResult>;
}
