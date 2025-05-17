import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Availability } from '../entities/availability.entity';
import { IAvailabilityRepository } from '../../domain/repositories/availability.repository.interface';
import { BaseRepository } from 'src/shared/repositories/base.repository';

@Injectable()
export class AvailabilityRepository
  extends BaseRepository<Availability>
  implements IAvailabilityRepository
{
  constructor(
    @InjectRepository(Availability)
    private readonly repository: Repository<Availability>,
  ) {
    super(repository, Availability.name, ['doctor']);
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
