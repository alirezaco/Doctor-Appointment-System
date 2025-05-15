import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsAlpha,
  Matches,
} from 'class-validator';

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @Matches(/^[a-zA-Z\s\.]+$/)
  @ApiProperty({
    description: 'The name of the doctor',
    example: 'John Doe',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsAlpha()
  @ApiProperty({
    description: 'The specialty of the doctor',
    example: 'Cardiology',
  })
  specialty: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    description: 'The bio of the doctor',
    example: 'Dr. John Doe is a cardiologist with 15 years of experience',
  })
  bio?: string;
}
