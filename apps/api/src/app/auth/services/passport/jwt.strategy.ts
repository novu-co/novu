import type http from 'http';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Instrument, HttpRequestHeaderKeysEnum } from '@novu/application-generic';
import { ApiAuthSchemeEnum, UserSessionData } from '@novu/shared';
import { EnvironmentRepository } from '@novu/dal';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private environmentRepository: EnvironmentRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }
  @Instrument()
  async validate(req: http.IncomingMessage, session: UserSessionData) {
    // Set the scheme to Bearer, meaning the user is authenticated via a JWT coming from Dashboard
    // eslint-disable-next-line no-param-reassign
    session.scheme = ApiAuthSchemeEnum.BEARER;

    const user = await this.authService.validateUser(session);
    if (!user) {
      throw new UnauthorizedException();
    }

    const environmentId = this.resolveEnvironmentId(req, session);

    // eslint-disable-next-line no-param-reassign
    session.environmentId = environmentId;

    if (session.environmentId) {
      const environment = await this.environmentRepository.findOne(
        {
          _id: session.environmentId,
          _organizationId: session.organizationId,
        },
        '_id'
      );

      if (!environment) {
        throw new UnauthorizedException('Cannot find environment', JSON.stringify({ session }));
      }
    }

    return session;
  }

  @Instrument()
  resolveEnvironmentId(req: http.IncomingMessage, session: UserSessionData) {
    const environmentIdFromHeader =
      (req.headers[HttpRequestHeaderKeysEnum.NOVU_ENVIRONMENT_ID.toLowerCase()] as string) || '';

    return environmentIdFromHeader;
  }
}
