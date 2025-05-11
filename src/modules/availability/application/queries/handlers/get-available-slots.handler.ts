import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAvailableSlotsQuery } from '../impl/get-available-slots.query';
import { IAvailabilityRepository } from '../../../domain/repositories/availability.repository.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IDoctorRepository } from 'src/modules/doctors/domain/repositories/doctor.repository.interface';

@QueryHandler(GetAvailableSlotsQuery)
export class GetAvailableSlotsHandler
  implements IQueryHandler<GetAvailableSlotsQuery>
{
  private readonly logger = new Logger(GetAvailableSlotsHandler.name);

  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly doctorRepository: IDoctorRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(
    query: GetAvailableSlotsQuery,
  ): Promise<{ startTime: string; endTime: string }[]> {
    const { doctorId, date } = query;
    this.logger.log(
      `Getting available slots for doctor ${doctorId} on ${date.toISOString()}`,
    );

    // Verify doctor exists
    await this.doctorRepository.findById(doctorId);
    this.logger.debug(`Doctor ${doctorId} verified`);

    // Try to get from cache first
    const cacheKey = `available-slots:${doctorId}:${date.toISOString().split('T')[0]}`;
    const cachedSlots =
      await this.cacheManager.get<{ startTime: string; endTime: string }[]>(
        cacheKey,
      );

    if (cachedSlots) {
      this.logger.debug(`Found ${cachedSlots.length} slots in cache`);
      return cachedSlots;
    }

    // If not in cache, get from repository
    const slots = await this.availabilityRepository.findAvailableSlots(
      doctorId,
      date,
    );
    this.logger.debug(`Found ${slots.length} slots from repository`);

    // Cache the result for 1 hour
    await this.cacheManager.set(cacheKey, slots, 3600000);
    this.logger.debug('Slots cached for 1 hour');

    return slots;
  }
}
