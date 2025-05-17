import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from '../impl/login.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/modules/users/domain/repositories/user.repository.interface';
import { UserLoggedInEvent } from 'src/modules/auth/domain/events/user-logged-in.event';
import * as bcrypt from 'bcrypt';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LoginCommand): Promise<{ access_token: string }> {
    const { email, password } = command;
    this.logger.log(`Attempting login for user with email: ${email}`);

    try {
      const user = await this.userRepository.findByEmail(email);
      this.logger.debug(`User found with ID: ${user.id}`);

      // Compare password
      await this.comparePassword(password, user.password, email);

      const payload = { sub: user.id, email: user.email, role: user.role };
      const access_token = this.jwtService.sign(payload);
      this.logger.debug(`JWT token generated for user: ${user.id}`);

      this.eventBus.publish(new UserLoggedInEvent(user));
      this.logger.debug('UserLoggedInEvent published');

      this.logger.log(`User ${user.id} logged in successfully`);
      return { access_token };
    } catch (error) {
      this.logger.error(`Login failed for email: ${email}`, error.stack);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
    email: string,
  ) {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
