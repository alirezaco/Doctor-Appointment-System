import { CreateAppointmentDto } from 'src/modules/appointments/presentation/dtos/create-appointment.dto';

export class CreateAppointmentCommand {
  constructor(
    public readonly createAppointmentDto: CreateAppointmentDto,
    public readonly patientId: string,
  ) {}
}
