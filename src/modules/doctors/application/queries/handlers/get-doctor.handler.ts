import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetDoctorQuery } from '../impl/get-doctor.query';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY,
} from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../infrastructure/entities/doctor.entity';

@QueryHandler(GetDoctorQuery)
export class GetDoctorHandler implements IQueryHandler<GetDoctorQuery> {
  private readonly logger = new Logger(GetDoctorHandler.name);

  constructor(
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: GetDoctorQuery): Promise<Doctor> {
    const { id } = query;
    this.logger.log(`Getting doctor with ID: ${id}`);

    const doctor = await this.doctorRepository.findById(id);
    this.logger.debug(`Doctor ${id} found`);

    return doctor;
  }
}
