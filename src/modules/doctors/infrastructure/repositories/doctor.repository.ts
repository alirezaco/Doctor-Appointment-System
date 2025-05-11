import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { IDoctorRepository } from '../../domain/repositories/doctor.repository.interface';

@Injectable()
export class DoctorRepository implements IDoctorRepository {
  constructor(
    @InjectRepository(Doctor)
    private readonly repository: Repository<Doctor>,
  ) {}

  async create(doctor: Doctor): Promise<Doctor> {
    return this.repository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.repository.findOne({ where: { id } });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    const doctor = await this.findById(id);
    Object.assign(doctor, updates);
    return this.repository.save(doctor);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
