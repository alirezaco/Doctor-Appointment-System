import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IUserToken } from 'src/shared/interfaces/user-token.interface';
import { IPayloadToken } from '../interfaces/payload-token.interface';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'secret',
    });
  }

  async validate(payload: IPayloadToken): Promise<IUserToken> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
