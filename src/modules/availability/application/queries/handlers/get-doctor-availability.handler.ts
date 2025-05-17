import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDoctorAvailabilityQuery } from '../impl/get-doctor-availability.query';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from '../../../domain/repositories/availability.repository.interface';
import { Inject, Logger } from '@nestjs/common';
import {
  DOCTOR_REPOSITORY,
  IDoctorRepository,
} from 'src/modules/doctors/domain/repositories/doctor.repository.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@QueryHandler(GetDoctorAvailabilityQuery)
export class GetDoctorAvailabilityHandler
  implements IQueryHandler<GetDoctorAvailabilityQuery>
{
  private readonly logger = new Logger(GetDoctorAvailabilityHandler.name);

  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: IAvailabilityRepository,
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(
    query: GetDoctorAvailabilityQuery,
  ): Promise<{ startTime: string; endTime: string }[]> {
    const { doctorId, date } = query;
    this.logger.log(
      `Getting doctor availability for doctor ${doctorId} on ${date}`,
    );

    // Verify doctor exists
    await this.doctorRepository.findById(doctorId);
    this.logger.debug(`Doctor ${doctorId} verified`);

    // If not in cache, get from repository
    const slots = await this.availabilityRepository.findAvailableSlots(
      doctorId,
      date,
    );
    this.logger.debug(`Found ${slots.length} slots from repository`);

    return slots;
  }
}
