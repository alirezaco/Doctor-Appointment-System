import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { CreateAvailabilityCommand } from '../impl/create-availability.command';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from '../../../domain/repositories/availability.repository.interface';
import {
  DOCTOR_REPOSITORY,
  IDoctorRepository,
} from '../../../../doctors/domain/repositories/doctor.repository.interface';
import { Availability } from '../../../infrastructure/entities/availability.entity';
import { AvailabilityCreatedEvent } from '../../../domain/events/availability-created.event';

@CommandHandler(CreateAvailabilityCommand)
export class CreateAvailabilityHandler
  implements ICommandHandler<CreateAvailabilityCommand>
{
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: IAvailabilityRepository,
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateAvailabilityCommand): Promise<Availability> {
    const { doctorId, createAvailabilityDto } = command;

    // Verify doctor exists
    await this.doctorRepository.findById(doctorId);

    // Check for overlapping availabilities
    try {
      await this.availabilityRepository.findOverlapping(
        doctorId,
        createAvailabilityDto.date,
        createAvailabilityDto.startTime,
        createAvailabilityDto.endTime,
      );
      throw new ConflictException(
        'Time slot overlaps with existing availability',
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // If NotFoundException is thrown, it means no overlapping availability was found
    }

    const availability = new Availability();
    Object.assign(availability, {
      ...createAvailabilityDto,
      doctor: { id: doctorId },
    });

    const createdAvailability =
      await this.availabilityRepository.create(availability);
    this.eventBus.publish(new AvailabilityCreatedEvent(createdAvailability));

    return createdAvailability;
  }
}
