import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { UpdateUserCommand } from '../impl/update-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../infrastructure/entities/user.entity';
import { UserUpdatedEvent } from '../../../domain/events/user-updated.event';
import * as bcrypt from 'bcrypt';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { id, updateUserDto } = command;
    this.logger.log(`Updating user with ID: ${id}`);

    // Check if user exists
    await this.userRepository.findById(id);
    this.logger.debug(`User ${id} found`);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      this.logger.debug('Password hashed successfully');
    }

    // Check if user with email already exists
    if (updateUserDto.email) {
      await this.checkIfUserExists(updateUserDto.email);
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    this.logger.log(`User ${id} updated successfully`);

    this.eventBus.publish(new UserUpdatedEvent(updatedUser));
    this.logger.debug('UserUpdatedEvent published');

    return updatedUser;
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
