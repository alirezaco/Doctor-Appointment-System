import { Availability } from '../../infrastructure/entities/availability.entity';

export class AvailabilityCreatedEvent {
  constructor(public readonly availability: Availability) {}
}
