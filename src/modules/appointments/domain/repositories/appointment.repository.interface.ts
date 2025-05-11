import { Appointment } from '../../infrastructure/entities/appointment.entity';

export const APPOINTMENT_REPOSITORY = 'APPOINTMENT_REPOSITORY';

export interface IAppointmentRepository {
  create(appointment: Appointment): Promise<Appointment>;
  findById(id: string): Promise<Appointment>;
  findAll(): Promise<Appointment[]>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;
  findByDoctorId(doctorId: string): Promise<Appointment[]>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findOverlapping(
    doctorId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<null>;
}
