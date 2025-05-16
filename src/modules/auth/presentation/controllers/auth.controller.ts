import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Public } from '../../../../shared/decorators/public.decorator';
import { LoginCommand } from '../../application/commands/impl/login.command';
import { LoginDto } from '../dtos/login.dto';
import {
  CommonSwaggerAPIDecorator,
  CommonSwaggerControllerDecorator,
} from 'src/shared/decorators/common-swagger.decorator';
import { AuthUseCase } from '../../application/use-cases/auth.use-case';

@CommonSwaggerControllerDecorator('auth', false)
@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('login')
  @Public()
  @CommonSwaggerAPIDecorator({
    operation: 'User login',
    response: { access_token: String },
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED],
  })
  login(@Body() loginDto: LoginDto) {
    return this.authUseCase.login(loginDto);
  }
}
