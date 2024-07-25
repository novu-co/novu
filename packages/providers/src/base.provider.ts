import { deepmerge } from '../../framework/src/utils/deepmerge.utils';
import {
  camelCase,
  capitalCase,
  constantCase,
  kebabCase,
  pascalCase,
  snakeCase,
} from '../../framework/src/utils/change-case/index';

export enum CasingEnum {
  CAMEL_CASE = 'camelCase',
  PASCAL_CASE = 'PascalCase',
  CAPITAL_CASE = 'CapitalCase',
  SNAKE_CASE = 'snake_case',
  KEBAB_CASE = 'kebabcase',
  CONSTANT_CASE = 'CONSTANT_CASE',
}

type TransformOutput<T> = {
  body: Record<string, T>;
  headers: Record<string, string>;
};

export abstract class BaseProvider {
  protected casing: CasingEnum = CasingEnum.CAMEL_CASE;

  protected transform<Input = Record<string, unknown>, Output = unknown>(
    bridgeProvderData: Input & {
      passthrough: {
        body: Record<string, unknown>;
        headers: Record<string, string>;
      };
    }
  ): TransformOutput<Output> {
    const { passthrough, ...data } = bridgeProvderData;
    let casing = camelCase;

    switch (this.casing) {
      case CasingEnum.PASCAL_CASE:
        casing = pascalCase;
        break;
      case CasingEnum.CAPITAL_CASE:
        casing = capitalCase;
        break;
      case CasingEnum.SNAKE_CASE:
        casing = snakeCase;
        break;
      case CasingEnum.KEBAB_CASE:
        casing = kebabCase;
        break;
      case CasingEnum.CONSTANT_CASE:
        casing = constantCase;
        break;
    }

    const body = casing(data) as Record<string, unknown>;

    return {
      body: deepmerge(body, passthrough.body) as Record<string, Output>,
      headers: {
        ...passthrough.headers,
      },
    };
  }
}
