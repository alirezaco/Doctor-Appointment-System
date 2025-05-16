import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginHandler } from './application/commands/handlers/login.handler';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../../shared/shared.module';
import { JwtStrategy } from './infrastructure/strategries/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { AuthUseCase } from './application/use-cases/auth.use-case';
const CommandHandlers = [LoginHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers, JwtStrategy, AuthUseCase],
})
export class AuthModule {}
