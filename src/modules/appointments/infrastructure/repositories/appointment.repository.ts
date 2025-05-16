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

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repository: Repository<Appointment>,
  ) {}

  async create(appointment: Appointment): Promise<Appointment> {
    return this.repository.save(appointment);
  }

  async findById(id: string): Promise<Appointment> {
    const appointment = await this.repository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.repository.find({
      relations: ['doctor', 'patient'],
    });
  }

  async update(
    id: string,
    appointment: Partial<Appointment>,
  ): Promise<Appointment> {
    await this.repository.update(id, appointment);
    return this.findById(id);
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

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
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
