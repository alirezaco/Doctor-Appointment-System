import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './presentation/controllers/appointments.controller';
import { CreateAppointmentHandler } from './application/commands/handlers/create-appointment.handler';
import { Appointment } from './infrastructure/entities/appointment.entity';
import { AppointmentRepository } from './infrastructure/repositories/appointment.repository';
import { APPOINTMENT_REPOSITORY } from './domain/repositories/appointment.repository.interface';
import { GetDoctorAppointmentsHandler } from './application/queries/handlers/get-doctor-appointments.handler';
import { DoctorsModule } from '../doctors/doctors.module';
import { CancelAppointmentHandler } from './application/commands/handlers/cancel-appointment.handler';
import { AppointmentUseCase } from './application/use-cases/appointment.use-cae';

const CommandHandlers = [CreateAppointmentHandler, CancelAppointmentHandler];
const QueryHandlers = [GetDoctorAppointmentsHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Appointment]), DoctorsModule],
  controllers: [AppointmentsController],
  providers: [
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    AppointmentUseCase,
  ],
  exports: [APPOINTMENT_REPOSITORY],
})
export class AppointmentsModule {}
