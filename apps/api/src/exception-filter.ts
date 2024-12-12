import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CommandValidationException, PinoLogger } from '@novu/application-generic';
import { randomUUID } from 'node:crypto';
import { captureException } from '@sentry/node';
import { ZodError } from 'zod';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';

export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseMetadata = this.getResponseMetadata(exception);
    const responseBody = this.buildResponseBody(request, responseMetadata, exception);

    response.status(responseMetadata.status).json(responseBody);
  }

  private buildResponseBody(request: Request, responseMetadata: ResponseMetadata, exception: unknown): ErrorDto {
    const responseBody = this.buildBaseResponseBody(request, responseMetadata);
    if (responseMetadata.status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return this.logAndBuild500Error(exception, responseBody);
    }

    return this.logAndBuildOtherErrors(responseBody, exception);
  }

  private logAndBuildOtherErrors(responseBody: ErrorResponseBody, exception: unknown) {
    this.logger.error({
      /**
       * It's important to use `err` as the key, pino (the logger we use) will
       * log an empty object if the key is not `err`
       *
       * @see https://github.com/pinojs/pino/issues/819#issuecomment-611995074
       */
      err: exception,
      error: responseBody,
    });

    return responseBody;
  }

  private logAndBuild500Error(exception: unknown, responseBody: ErrorResponseBody) {
    const uuid = this.getUuid(exception);
    this.logError(uuid, exception);

    return { ...responseBody, errorId: uuid };
  }

  private buildBaseResponseBody(request: Request, responseMetadata: ResponseMetadata): ErrorResponseBody {
    return {
      ...responseMetadata.ctx,
      statusCode: responseMetadata.status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: responseMetadata.message,
      ctx: responseMetadata.ctx,
    };
  }

  private getResponseMetadata(exception: unknown): ResponseMetadata {
    if (exception instanceof ZodError) {
      return handleZod(exception);
    }
    if (exception instanceof CommandValidationException) {
      return this.handleCommandValidation(exception);
    }

    if (exception instanceof HttpException && !(exception instanceof InternalServerErrorException)) {
      return this.handleOtherHttpExceptions(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Internal server error, contact support and provide them with the errorId`,
    };
  }

  private handleOtherHttpExceptions(exception: HttpException): ResponseMetadata {
    const status = exception.getStatus();
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return { status, message: response as string };
    }

    if (hasMessage(response)) {
      return {
        status,
        message: response.message,
        ctx: { ...response, message: undefined },
      };
    }

    return { status, message: `Api Exception Raised with status ${status}` };
  }
  private handleCommandValidation(exception: CommandValidationException): ResponseMetadata {
    return {
      message: exception.message,
      status: HttpStatus.BAD_REQUEST,
      ctx: { cause: exception.constraintsViolated },
    };
  }

  private logError(uuid: string, exception: unknown) {
    this.logger.error(
      {
        errorId: uuid,
        /**
         * It's important to use `err` as the key, pino (the logger we use) will
         * log an empty object if the key is not `err`
         *
         * @see https://github.com/pinojs/pino/issues/819#issuecomment-611995074
         */
        err: exception,
      },
      `Unexpected exception thrown`,
      'Exception'
    );
  }

  private getUuid(exception: unknown) {
    if (process.env.SENTRY_DSN) {
      try {
        return captureException(exception);
      } catch (e) {
        return randomUUID();
      }
    } else {
      return randomUUID();
    }
  }
}

/**
 * Interface representing the structure of an error response.
 */
export class ErrorDto {
  statusCode: number;
  timestamp: string;

  /**
   * Optional unique identifier for the error, useful for tracking using sentry and newrelic, only available for 500
   */
  errorId?: string;

  path: string;
  message: string | object;
}

function handleZod(exception: ZodError) {
  const status = HttpStatus.BAD_REQUEST; // Set appropriate status for ZodError
  const ctx = {
    errors: exception.errors.map((err) => ({
      message: err.message,
      path: err.path,
    })),
  };

  return { status, message: 'Zod Validation Failed', ctx };
}
class ResponseMetadata {
  status: number;
  message: string;
  ctx?: object | Object;
}
class ErrorResponseBody {
  path: string;
  message: string;
  statusCode: number;
  timestamp: string;
  ctx?: object | Object;
}
function hasMessage(response: unknown): response is { message: string } {
  return typeof response === 'object' && response !== null && 'message' in response;
}
