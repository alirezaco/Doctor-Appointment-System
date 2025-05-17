import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllDoctorsQuery } from '../impl/get-all-doctors.query';
import {
  DOCTOR_REPOSITORY,
  IDoctorRepository,
} from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../infrastructure/entities/doctor.entity';
import { Inject, Logger } from '@nestjs/common';

@QueryHandler(GetAllDoctorsQuery)
export class GetAllDoctorsHandler implements IQueryHandler<GetAllDoctorsQuery> {
  private readonly logger = new Logger(GetAllDoctorsHandler.name);

  constructor(
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: GetAllDoctorsQuery): Promise<Doctor[]> {
    this.logger.log('Getting all doctors');

    const doctors = await this.doctorRepository.findAll(query.filter);
    this.logger.debug(`Found ${doctors.length} doctors`);

    return doctors;
  }
}
