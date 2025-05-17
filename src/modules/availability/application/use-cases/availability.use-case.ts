import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAvailabilityDto } from '../../presentation/dtos/create-availability.dto';
import { CreateAvailabilityCommand } from '../commands/impl/create-availability.command';
import { Availability } from '../../infrastructure/entities/availability.entity';
import { GetDoctorAvailabilityQuery } from '../queries/impl/get-doctor-availability.query';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DOCTOR_AVAILABILITY_CACHE_KEY } from 'src/shared/constants/cache-key.constant';

@Injectable()
export class AvailabilityUseCase {
  private readonly logger = new Logger(AvailabilityUseCase.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    doctorId: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<Availability> {
    // Delete the cache key for the doctor's availability
    const cacheKey = this.createCacheKey(doctorId, createAvailabilityDto.date);
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Deleted cache key: ${cacheKey}`);

    return this.commandBus.execute<CreateAvailabilityCommand, Availability>(
      new CreateAvailabilityCommand(doctorId, createAvailabilityDto),
    );
  }

  async getDoctorAvailability(
    doctorId: string,
    date: string,
  ): Promise<Availability[]> {
    // Try to get from cache first
    const cacheKey = this.createCacheKey(doctorId, date);
    const cachedSlots = await this.cacheManager.get<Availability[]>(cacheKey);

    if (cachedSlots) {
      this.logger.debug(`Found ${cachedSlots.length} slots in cache`);
      return cachedSlots;
    }

    const res: Availability[] = await this.queryBus.execute<
      GetDoctorAvailabilityQuery,
      Availability[]
    >(new GetDoctorAvailabilityQuery(doctorId, date));

    // Cache the result for 1 hour
    await this.cacheManager.set(cacheKey, res, 3600000);
    this.logger.debug('Slots cached for 1 hour');

    return res;
  }

  private createCacheKey(doctorId: string, date: string): string {
    return `${DOCTOR_AVAILABILITY_CACHE_KEY}:${doctorId}:${date}`;
  }
}
