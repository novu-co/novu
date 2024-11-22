// eslint-disable-next-line import/no-namespace
import type * as nestSwagger from '@nestjs/swagger';

type NestJsExport = keyof typeof nestSwagger;
export type ApiResponseDecoratorName = NestJsExport & `Api${string}Response`;
