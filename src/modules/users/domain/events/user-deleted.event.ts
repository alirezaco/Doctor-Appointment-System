import { User } from '../../infrastructure/entities/user.entity';

export class UserDeletedEvent {
  constructor(public readonly user: User) {}
}
