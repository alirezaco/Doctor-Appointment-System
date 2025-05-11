import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginHandler } from './application/commands/handlers/login.handler';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../../shared/shared.module';
import { JwtStrategy } from './infrastructure/strategries/jwt.strategy';
const CommandHandlers = [LoginHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers, JwtStrategy],
})
export class AuthModule {}
