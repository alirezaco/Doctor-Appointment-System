import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { IFilter } from 'src/shared/interfaces/filter.interface';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(filter?: IFilter): Promise<User[]>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findByRole(role: UserRole): Promise<User[]>;
}
