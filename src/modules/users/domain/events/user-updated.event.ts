import { User } from '../../infrastructure/entities/user.entity';

export class UserUpdatedEvent {
  constructor(public readonly user: User) {}
}
