import { Type } from '@nestjs/common';

export function applyDecorators<T>(baseClass: Type<T>, decorators: Array<ClassDecorator> = []): Type<T> {
  return decorators.reduce((decoratedController, decorator) => {
    const result = decorator(decoratedController);

    return result as Type<T>;
  }, baseClass);
}
