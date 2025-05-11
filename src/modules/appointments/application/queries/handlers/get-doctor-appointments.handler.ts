import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDoctorAppointmentsQuery } from '../impl/get-doctor-appointments.query';
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../infrastructure/entities/appointment.entity';
import { Inject } from '@nestjs/common';

@QueryHandler(GetDoctorAppointmentsQuery)
export class GetDoctorAppointmentsHandler
  implements IQueryHandler<GetDoctorAppointmentsQuery>
{
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(query: GetDoctorAppointmentsQuery): Promise<Appointment[]> {
    return this.appointmentRepository.findByDoctorId(query.doctorId);
  }
}
