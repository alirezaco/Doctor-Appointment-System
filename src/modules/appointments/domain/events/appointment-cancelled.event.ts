import { Appointment } from 'src/modules/appointments/infrastructure/entities/appointment.entity';

export class AppointmentCancelledEvent {
  constructor(public readonly appointment: Appointment) {}
}
