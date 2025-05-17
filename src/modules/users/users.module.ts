import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/controllers/users.controller';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { UpdateUserHandler } from './application/commands/handlers/update-user.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { GetUsersHandler } from './application/queries/handlers/get-users.handler';
import { User } from './infrastructure/entities/user.entity';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserUseCase } from './application/use-cases/user.use-case';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler];
const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    UserUseCase,
  ],
  exports: [USER_REPOSITORY],
})
@Global()
export class UsersModule {}
