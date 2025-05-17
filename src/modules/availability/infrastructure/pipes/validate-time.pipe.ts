import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreateAvailabilityDto } from '../../presentation/dtos/create-availability.dto';

@Injectable()
export class ValidateTimePipe implements PipeTransform {
  transform(value: CreateAvailabilityDto) {
    if (value.startTime > value.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    return value;
  }
}
