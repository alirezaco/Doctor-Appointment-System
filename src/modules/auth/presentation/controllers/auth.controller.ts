import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { Public } from '../../../../shared/decorators/public.decorator';
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
  @HttpCode(HttpStatus.OK)
  @CommonSwaggerAPIDecorator({
    operation: 'User login',
    response: { access_token: String },
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED],
  })
  login(@Body() loginDto: LoginDto) {
    return this.authUseCase.login(loginDto);
  }
}
