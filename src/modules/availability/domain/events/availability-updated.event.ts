import { Availability } from '../../infrastructure/entities/availability.entity';

export class AvailabilityUpdatedEvent {
  constructor(public readonly availability: Availability) {}
}
