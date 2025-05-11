import { UpdateDoctorDto } from 'src/modules/doctors/presentation/dtos/update-doctor.dto';

export class UpdateDoctorCommand {
  constructor(
    public readonly id: string,
    public readonly updateDoctorDto: UpdateDoctorDto,
  ) {}
}
