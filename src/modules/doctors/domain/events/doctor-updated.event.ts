import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';

export class DoctorUpdatedEvent {
  constructor(public readonly doctor: Doctor) {}
}
