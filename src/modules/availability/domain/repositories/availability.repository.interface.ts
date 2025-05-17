import { Availability } from '../../infrastructure/entities/availability.entity';

export const AVAILABILITY_REPOSITORY = Symbol('AVAILABILITY_REPOSITORY');

export interface IAvailabilityRepository {
  create(availability: Availability): Promise<Availability>;
  findById(id: string): Promise<Availability>;
  findByDoctorId(doctorId: string, date: string): Promise<Availability[]>;
  findAll(): Promise<Availability[]>;
  update(
    id: string,
    availability: Partial<Availability>,
  ): Promise<Availability>;
  delete(id: string): Promise<void>;
  findOverlapping(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<void>;
  findAvailableSlots(doctorId: string, date: string): Promise<Availability[]>;
}
