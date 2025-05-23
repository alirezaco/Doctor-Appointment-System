import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the doctor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  doctorId: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'The start time of the appointment',
    example: '2025-01-01T00:00:00.000Z',
  })
  startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'The end time of the appointment',
    example: '2025-01-01T00:00:00.000Z',
  })
  endTime: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'The notes of the appointment',
    example: 'This is a note',
  })
  notes?: string;
}
