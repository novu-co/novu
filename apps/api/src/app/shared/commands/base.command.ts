import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { addBreadcrumb } from '@sentry/node';
import { BadRequestException } from '@nestjs/common';

interface IConstraint {
  path: string[];
  constraint: string[];
}

function extractConstraints(obj: any, path: string[] = []): IConstraint[] {
  const constraints: IConstraint[] = [];

  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      const currentLocation = obj[key]?.property;
      const newPath = [...path, currentLocation];
      if (obj[key].constraints) {
        constraints.push({ path: [...newPath, key], constraint: Object.values(obj[key].constraints) });
      }
      constraints.push(...extractConstraints(obj[key].children, newPath));
    }
  }

  return constraints;
}

export abstract class BaseCommand {
  static create<T extends BaseCommand>(this: new (...args: unknown[]) => T, data: T): T {
    const convertedObject = plainToInstance<T, unknown>(this, {
      ...data,
    });

    const errors = validateSync(convertedObject as unknown as object);
    if (errors?.length) {
      const mappedErrors = extractConstraints(errors);

      if (mappedErrors.length > 0) {
        addBreadcrumb({
          category: 'BaseCommand',
          data: mappedErrors,
        });

        throw new BadRequestException(mappedErrors);
      }
    }

    return convertedObject;
  }
}
