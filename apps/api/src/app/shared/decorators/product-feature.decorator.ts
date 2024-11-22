import { Reflector } from '@nestjs/core';
import { type ProductFeatureKeyEnum } from '@novu/shared';

export const ProductFeature = Reflector.createDecorator<ProductFeatureKeyEnum>();
