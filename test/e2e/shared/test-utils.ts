import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../../src/shared/enums/user-role.enum';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { Repository } from 'typeorm';

export const createAuthToken = (
  jwtService: JwtService,
  role: UserRole = UserRole.ADMIN,
  id: string = '1',
): string => {
  return jwtService.sign({
    sub: id,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
};

export const getTestHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const findOrCreateUser = async (
  userRepository: Repository<User>,
  email: string,
  role: UserRole,
) => {
  let user: User | null = await userRepository.findOne({ where: { email } });
  if (!user) {
    user = new User();
    user.email = email;
    user.role = role;
    user.password = 'password';
    user.firstName = email.split('@')[0];
    user.lastName = email.split('@')[0];
    user = await userRepository.save(user);
  }

  return user;
};
