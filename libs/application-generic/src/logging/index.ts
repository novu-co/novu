import { NestInterceptor, RequestMethod } from '@nestjs/common';
import {
  getLoggerToken,
  Logger,
  LoggerErrorInterceptor,
  LoggerModule,
  Params,
  PinoLogger,
} from 'nestjs-pino';
import { storage, Store } from 'nestjs-pino/storage';

const cardFields = ['credit', 'debit', 'creditCard', 'debitCard'];

const emailFields = ['primaryEmail', 'secondaryEmail', 'email'];

const passwordFields = [
  'password',
  'token',
  'apiKey',
  'apiKeys',
  'secretKey',
  'firstName',
  'lastName',
  'organizationName',
  'senderName',
  'username',
];

const phoneFields = ['homePhone', 'workPhone', 'phone'];

const addressFields = [
  'addressLine1',
  'addressLine2',
  'address',
  'cardAddress',
];

const httpFields = ['webhookUrl', 'avatar', 'avatar_url'];

const uuidFields = [];

export const sensitiveFields = cardFields.concat(
  emailFields,
  passwordFields,
  phoneFields,
  addressFields,
  uuidFields,
  httpFields,
);
export * from './LogDecorator';

export function getErrorInterceptor(): NestInterceptor {
  return new LoggerErrorInterceptor();
}

export { Logger, LoggerModule, PinoLogger, storage, Store, getLoggerToken };

const AVAILABLE_LOG_LEVELS = Object.freeze([
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
]);

export function buildLoggerModuleOptions({
  serviceName,
  serviceVersion,
}: {
  serviceName: string;
  serviceVersion: string;
}): Params {
  const env = process.env.NODE_ENV ?? 'local';
  const platform = process.env.HOSTING_PLATFORM ?? 'Docker';
  const tenant = process.env.TENANT ?? 'OS';

  let level = process.env.LOGGING_LEVEL ?? 'info';
  if (!AVAILABLE_LOG_LEVELS.includes(level)) {
    level = 'info';
  }

  let redactFields: string[] = sensitiveFields.map((val) => val);

  redactFields.push('req.headers.authorization');

  const baseWildCards = '*.';
  const baseArrayWildCards = '*[*].';
  for (let i = 1; i <= 6; i += 1) {
    redactFields = redactFields.concat(
      sensitiveFields.map((val) => baseWildCards.repeat(i) + val),
    );

    redactFields = redactFields.concat(
      sensitiveFields.map((val) => baseArrayWildCards.repeat(i) + val),
    );
  }

  const transport = ['local', 'test', 'debug'].includes(process.env.NODE_ENV)
    ? { target: 'pino-pretty' }
    : undefined;

  return {
    exclude: [{ path: '*/health-check', method: RequestMethod.GET }],
    pinoHttp: {
      level,
      redact: {
        paths: redactFields,
      },
      base: {
        env,
        pid: process.pid,
        serviceName,
        serviceVersion,
        platform,
        tenant,
      },
      transport,
      autoLogging: !['test', 'local'].includes(env),
      /**
       * These custom props are only added to 'request completed' and 'request errored' logs.
       * Logs generated during request processing won't have these props by default.
       * To include these or any other custom props in mid-request logs,
       * use `PinoLogger.assign(<props>)` explicitly before logging.
       */
      customProps: (req: any, res: any) => ({
        user: {
          userId: req?.user?._id || null,
          environmentId: req?.user?.environmentId || null,
          organizationId: req?.user?.organizationId || null,
        },
        authScheme: req?.authScheme,
        rateLimitPolicy: res?.rateLimitPolicy,
      }),
    },
  };
}
