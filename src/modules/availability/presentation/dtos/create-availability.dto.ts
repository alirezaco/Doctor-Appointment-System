import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'The date of the availability',
    example: '2021-01-01',
  })
  date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @ApiProperty({
    description: 'The start time of the availability',
    example: '10:00',
  })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @ApiProperty({
    description: 'The end time of the availability',
    example: '11:00',
  })
  endTime: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'The doctor id of the availability',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  doctorId: string;
}
