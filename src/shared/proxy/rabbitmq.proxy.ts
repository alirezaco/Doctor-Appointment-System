import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQProxy {
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URL')],
        queue: 'queue_booked_appointment',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async publishAppointmentBooked(data: {
    appointmentId: string;
    doctorId: string;
    appointmentTime: Date;
  }) {
    return this.client.emit('appointment.booked', data);
  }
}
