import { User } from '../../infrastructure/entities/user.entity';

export class UserCreatedEvent {
  constructor(public readonly user: User) {}
}
