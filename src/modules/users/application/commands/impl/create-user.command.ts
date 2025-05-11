import { CreateUserDto } from '../../../presentation/dtos/create-user.dto';

export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}
