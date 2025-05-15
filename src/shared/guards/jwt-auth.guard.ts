import {
  Injectable,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants/auth.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(
        `Public route accessed: ${request.method} ${request.url}`,
      );
      return true;
    }

    this.logger.debug(
      `Protected route accessed: ${request.method} ${request.url}`,
    );
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(
        `Authentication failed: ${err?.message || 'No user found'}`,
      );
      throw new UnauthorizedException('Unauthorized');
    }
    this.logger.debug(`User authenticated: ${user.id}`);
    return user;
  }
}
