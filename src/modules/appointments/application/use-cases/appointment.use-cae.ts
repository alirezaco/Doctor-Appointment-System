import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAppointmentDto } from '../../presentation/dtos/create-appointment.dto';
import { CreateAppointmentCommand } from '../commands/impl/create-appointment.command';
import { GetDoctorAppointmentsQuery } from '../queries/impl/get-doctor-appointments.query';
import { CancelAppointmentCommand } from '../commands/impl/cancel-appointment.command';
import { Appointment } from '../../infrastructure/entities/appointment.entity';

@Injectable()
export class AppointmentUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    return this.commandBus.execute<CreateAppointmentCommand, Appointment>(
      new CreateAppointmentCommand(createAppointmentDto, userId),
    );
  }

  async getDoctorAppointments(
    doctorId: string,
    date: Date,
  ): Promise<Appointment[]> {
    return this.queryBus.execute<GetDoctorAppointmentsQuery, Appointment[]>(
      new GetDoctorAppointmentsQuery(doctorId, date),
    );
  }

  async cancel(id: string, userId: string): Promise<void> {
    return this.commandBus.execute<CancelAppointmentCommand, void>(
      new CancelAppointmentCommand(id, userId),
    );
  }
}
