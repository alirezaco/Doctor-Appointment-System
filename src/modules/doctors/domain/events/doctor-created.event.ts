import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';

export class DoctorCreatedEvent {
  constructor(public readonly doctor: Doctor) {}
}
