import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../constants/auth.constant';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
