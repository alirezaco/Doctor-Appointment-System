import { Availability } from '../../infrastructure/entities/availability.entity';

export class AvailabilityDeletedEvent {
  constructor(public readonly availability: Availability) {}
}
