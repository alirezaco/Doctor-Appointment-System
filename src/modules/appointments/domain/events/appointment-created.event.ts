import { Appointment } from 'src/modules/appointments/infrastructure/entities/appointment.entity';

export class AppointmentCreatedEvent {
  constructor(public readonly appointment: Appointment) {}
}
