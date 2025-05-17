import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { IDoctorRepository } from '../../domain/repositories/doctor.repository.interface';
import { BaseRepository } from 'src/shared/repositories/base.repository';

@Injectable()
export class DoctorRepository
  extends BaseRepository<Doctor>
  implements IDoctorRepository
{
  constructor(
    @InjectRepository(Doctor)
    private readonly repository: Repository<Doctor>,
  ) {
    super(repository, Doctor.name);
  }
}
