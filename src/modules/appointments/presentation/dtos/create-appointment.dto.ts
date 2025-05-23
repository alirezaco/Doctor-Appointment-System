import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
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
  @IsUUID()
  @ApiProperty({
    description: 'The Id of valability slot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  availabilityId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'The notes of the appointment',
    example: 'This is a note',
  })
  notes?: string;
}
