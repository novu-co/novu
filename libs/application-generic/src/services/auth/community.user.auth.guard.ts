import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PinoLogger } from '../../logging';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import {
  ApiAuthSchemeEnum,
  IJwtClaims,
  PassportStrategyEnum,
  HandledUser,
  NONE_AUTH_SCHEME,
} from '@novu/shared';

@Injectable()
export class CommunityUserAuthGuard extends AuthGuard([
  PassportStrategyEnum.JWT,
  PassportStrategyEnum.HEADER_API_KEY,
]) {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions<any> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    const authScheme = authorizationHeader?.split(' ')[0] || NONE_AUTH_SCHEME;
    request.authScheme = authScheme;

    // Assign is only available in NestJS PinoLogger, not in the default Nest.js Logger used for local development
    if (this.logger instanceof PinoLogger) {
      this.logger.assign({ authScheme });
    }

    switch (authScheme) {
      case ApiAuthSchemeEnum.BEARER:
        return {
          session: false,
          defaultStrategy: PassportStrategyEnum.JWT,
        };
      case ApiAuthSchemeEnum.API_KEY: {
        const apiEnabled = this.reflector.get<boolean>(
          'external_api_accessible',
          context.getHandler(),
        );
        if (!apiEnabled)
          throw new UnauthorizedException('API endpoint not available');

        return {
          session: false,
          defaultStrategy: PassportStrategyEnum.HEADER_API_KEY,
        };
      }
      case NONE_AUTH_SCHEME:
        throw new UnauthorizedException('Missing authorization header');
      default:
        throw new UnauthorizedException(
          `Invalid authentication scheme: "${authScheme}"`,
        );
    }
  }

  handleRequest<TUser = IJwtClaims>(
    err: any,
    user: IJwtClaims | false,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    let handledUser: HandledUser;
    if (typeof user === 'object') {
      /**
       * This helps with sentry and other tools that need to know who the user is based on `id` property.
       */
      handledUser = {
        ...user,
        id: user._id,
        username: (user.firstName || '').trim(),
        domain: user.email?.split('@')[1],
      };
    } else {
      handledUser = user;
    }

    // Assign is only available in NestJS PinoLogger, not in the default Nest.js Logger used for local development
    if (this.logger instanceof PinoLogger) {
      this.logger.assign({ user: handledUser });
    }

    return super.handleRequest(err, handledUser, info, context, status);
  }
}
