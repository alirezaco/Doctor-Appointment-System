import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDoctorAvailabilityQuery } from '../impl/get-doctor-availability.query';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from '../../../domain/repositories/availability.repository.interface';
import { Availability } from '../../../infrastructure/entities/availability.entity';
import { Inject } from '@nestjs/common';

@QueryHandler(GetDoctorAvailabilityQuery)
export class GetDoctorAvailabilityHandler
  implements IQueryHandler<GetDoctorAvailabilityQuery>
{
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: IAvailabilityRepository,
  ) {}

  async execute(query: GetDoctorAvailabilityQuery): Promise<Availability[]> {
    return this.availabilityRepository.findAvailableSlots(
      query.doctorId,
      query.date,
    );
  }
}
