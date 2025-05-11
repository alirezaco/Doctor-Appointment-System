import { CreateDoctorDto } from 'src/modules/doctors/presentation/dtos/create-doctor.dto';

export class CreateDoctorCommand {
  constructor(public readonly createDoctorDto: CreateDoctorDto) {}
}
