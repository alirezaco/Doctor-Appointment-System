import { IFilter } from 'src/shared/interfaces/filter.interface';
import { Doctor } from '../../infrastructure/entities/doctor.entity';

export const DOCTOR_REPOSITORY = 'DOCTOR_REPOSITORY';

export interface IDoctorRepository {
  create(doctor: Doctor): Promise<Doctor>;
  findById(id: string): Promise<Doctor>;
  findAll(filter: IFilter): Promise<Doctor[]>;
  update(id: string, doctor: Partial<Doctor>): Promise<Doctor>;
  delete(id: string): Promise<void>;
}
