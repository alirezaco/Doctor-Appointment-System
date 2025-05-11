import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RabbitMQProxy } from './proxy/rabbitmq.proxy';

@Module({
  providers: [JwtAuthGuard, RolesGuard, RabbitMQProxy],
  exports: [JwtAuthGuard, RolesGuard, RabbitMQProxy],
})
@Global()
export class SharedModule {}
