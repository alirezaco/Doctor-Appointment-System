import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDoctorAvailabilityQuery } from '../impl/get-doctor-availability.query';
import { IAvailabilityRepository } from '../../../domain/repositories/availability.repository.interface';
import { Logger } from '@nestjs/common';
import { IDoctorRepository } from 'src/modules/doctors/domain/repositories/doctor.repository.interface';

@QueryHandler(GetDoctorAvailabilityQuery)
export class GetDoctorAvailabilityHandler
  implements IQueryHandler<GetDoctorAvailabilityQuery>
{
  private readonly logger = new Logger(GetDoctorAvailabilityHandler.name);

  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(
    query: GetDoctorAvailabilityQuery,
  ): Promise<{ startTime: string; endTime: string }[]> {
    const { doctorId, date } = query;
    this.logger.log(
      `Getting doctor availability for doctor ${doctorId} on ${date.toISOString()}`,
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
