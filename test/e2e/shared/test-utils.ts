import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../../src/shared/enums/user-role.enum';

export const createAuthToken = (
  jwtService: JwtService,
  role: UserRole = UserRole.ADMIN,
): string => {
  return jwtService.sign({
    sub: '1',
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
};

export const getTestHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
