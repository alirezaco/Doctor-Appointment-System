import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  specialty: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
