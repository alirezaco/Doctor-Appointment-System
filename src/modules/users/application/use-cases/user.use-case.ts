import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../infrastructure/entities/user.entity';
import { CreateUserCommand } from '../commands/impl/create-user.command';
import { GetUsersQuery } from '../queries/impl/get-users.query';
import { GetUserQuery } from '../queries/impl/get-user.query';
import { UpdateUserCommand } from '../commands/impl/update-user.command';
import { UpdateUserDto } from '../../presentation/dtos/update-user.dto';

@Injectable()
export class UserUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(createUserDto),
    );
  }

  async findAll(): Promise<User[]> {
    return this.queryBus.execute<GetUsersQuery, User[]>(new GetUsersQuery());
  }

  async findOne(id: string): Promise<User> {
    return this.queryBus.execute<GetUserQuery, User>(new GetUserQuery(id));
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.commandBus.execute<UpdateUserCommand, User>(
      new UpdateUserCommand(id, updateUserDto),
    );
  }
}
