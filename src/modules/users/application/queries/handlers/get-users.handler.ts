import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetUsersQuery } from '../impl/get-users.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../infrastructure/entities/user.entity';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  private readonly logger = new Logger(GetUsersHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<User[]> {
    this.logger.log('Getting all users');
    const users = await this.userRepository.findAll(query.filter);
    this.logger.debug(`Found ${users.length} users`);
    return users;
  }
}
