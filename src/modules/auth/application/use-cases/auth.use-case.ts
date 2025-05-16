import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/impl/login.command';
import { LoginDto } from '../../presentation/dtos/login.dto';

@Injectable()
export class AuthUseCase {
  constructor(private readonly commandBus: CommandBus) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    return this.commandBus.execute<LoginCommand, { access_token: string }>(
      new LoginCommand(loginDto.email, loginDto.password),
    );
  }
}
