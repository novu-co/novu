import { Reflector } from '@nestjs/core';
import { type ResourceEnum } from '@novu/shared';

export const ResourceCategory = Reflector.createDecorator<ResourceEnum>();
