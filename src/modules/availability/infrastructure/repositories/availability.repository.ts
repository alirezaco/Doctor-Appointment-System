import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Availability, DayOfWeek } from '../entities/availability.entity';
import { IAvailabilityRepository } from '../../domain/repositories/availability.repository.interface';

@Injectable()
export class AvailabilityRepository implements IAvailabilityRepository {
  constructor(
    @InjectRepository(Availability)
    private readonly repository: Repository<Availability>,
  ) {}

  async create(availability: Availability): Promise<Availability> {
    return this.repository.save(availability);
  }

  async findById(id: string): Promise<Availability> {
    const availability = await this.repository.findOne({
      where: { id },
      relations: ['doctor', 'doctor.user'],
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    return availability;
  }

  async findByDoctorId(
    doctorId: string,
    date: string,
  ): Promise<Availability[]> {
    return this.repository.find({
      where: {
        doctor: { id: doctorId },
        date: date,
      },
      relations: ['doctor'],
    });
  }

  async findAll(): Promise<Availability[]> {
    return this.repository.find({
      relations: ['doctor', 'doctor.user'],
    });
  }

  async update(
    id: string,
    availability: Partial<Availability>,
  ): Promise<Availability> {
    await this.repository.update(id, availability);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findOverlapping(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const availability = await this.repository.findOne({
      where: {
        doctor: { id: doctorId },
        date: date,
        startTime: Between(startTime, endTime),
      },
    });

    if (availability) {
      throw new ConflictException(
        'Time slot overlaps with existing availability',
      );
    }
  }

  async findAvailableSlots(
    doctorId: string,
    date: string,
  ): Promise<Availability[]> {
    return this.repository.find({
      where: {
        doctor: { id: doctorId },
        date: date,
        isAvailable: true,
      },
      relations: ['doctor'],
    });
  }
}
