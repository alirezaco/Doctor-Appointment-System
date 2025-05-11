import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/auth.constant';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      this.logger.debug(
        `No roles required for: ${request.method} ${request.url}`,
      );
      return true;
    }

    const { user } = request;
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (hasRole) {
      this.logger.debug(
        `User ${user.id} with role ${user.role} authorized for: ${request.method} ${request.url}`,
      );
    } else {
      this.logger.warn(
        `User ${user.id} with role ${user.role} unauthorized for: ${request.method} ${request.url}. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return hasRole;
  }
}
