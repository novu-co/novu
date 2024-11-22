import { Reflector } from '@nestjs/core';
import { type ApiRateLimitCategoryEnum, type ApiRateLimitCostEnum } from '@novu/shared';

export const ThrottlerCategory = Reflector.createDecorator<ApiRateLimitCategoryEnum>();

export const ThrottlerCost = Reflector.createDecorator<ApiRateLimitCostEnum>();
