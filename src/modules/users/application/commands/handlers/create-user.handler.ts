import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException, Inject, Logger } from '@nestjs/common';
import { CreateUserCommand } from '../impl/create-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../infrastructure/entities/user.entity';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';
import * as bcrypt from 'bcrypt';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { createUserDto } = command;
    this.logger.log(`Creating new user with email: ${createUserDto.email}`);

    // Check if user with email already exists
    await this.checkIfUserExists(createUserDto.email);

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    this.logger.debug('Password hashed successfully');

    const user = new User();
    Object.assign(user, {
      ...createUserDto,
      password: hashedPassword,
    });

    const createdUser = await this.userRepository.create(user);
    this.logger.log(`User created successfully with ID: ${createdUser.id}`);

    this.eventBus.publish(new UserCreatedEvent(createdUser));
    this.logger.debug('UserCreatedEvent published');

    return createdUser;
  }

  private async checkIfUserExists(email: string): Promise<void> {
    try {
      await this.userRepository.findByEmail(email);
      this.logger.warn(`User with email ${email} already exists`);
      throw new ConflictException('User with this email already exists');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.debug(`Email ${email} is available`);
    }
  }
}
