import { CreateAvailabilityDto } from '../../../presentation/dtos/create-availability.dto';

export class CreateAvailabilityCommand {
  constructor(
    public readonly doctorId: string,
    public readonly createAvailabilityDto: CreateAvailabilityDto,
  ) {}
}
