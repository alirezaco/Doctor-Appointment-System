import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
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
    const existingUser = await this.userRepository.findById(id);
    this.logger.debug(`User ${id} found`);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      this.logger.debug('Password hashed successfully');
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    this.logger.log(`User ${id} updated successfully`);

    this.eventBus.publish(new UserUpdatedEvent(updatedUser));
    this.logger.debug('UserUpdatedEvent published');

    return updatedUser;
  }
}
