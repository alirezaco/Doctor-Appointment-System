import { User } from '../../../users/infrastructure/entities/user.entity';

export class UserLoggedInEvent {
  constructor(public readonly user: User) {}
}
