import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { BaseRepository } from 'src/shared/repositories/base.repository';

@Injectable()
export class AppointmentRepository
  extends BaseRepository<Appointment>
  implements IAppointmentRepository
{
  constructor(
    @InjectRepository(Appointment)
    private readonly repository: Repository<Appointment>,
  ) {
    super(repository, Appointment.name);
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    return this.repository.find({
      where: {
        doctor: { id: doctorId },
        status: AppointmentStatus.SCHEDULED,
      },
      relations: ['doctor', 'patient'],
    });
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return this.repository.find({
      where: {
        patient: { id: patientId },
        status: AppointmentStatus.SCHEDULED,
      },
      relations: ['doctor', 'patient'],
    });
  }

  async findOverlapping(
    doctorId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<null> {
    const appointment = await this.repository.findOne({
      where: {
        doctor: { id: doctorId },
        startTime: Between(startTime, endTime),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    if (appointment) {
      throw new ConflictException('Time slot is already booked');
    }

    return null;
  }
}
