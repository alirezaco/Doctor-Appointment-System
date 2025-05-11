import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CancelAppointmentCommand } from '../impl/cancel-appointment.command';
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../infrastructure/entities/appointment.entity';
import { AppointmentCancelledEvent } from '../../../domain/events/appointment-cancelled.event';
import { Inject } from '@nestjs/common';

@CommandHandler(CancelAppointmentCommand)
export class CancelAppointmentHandler
  implements ICommandHandler<CancelAppointmentCommand>
{
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelAppointmentCommand): Promise<void> {
    const appointment = await this.appointmentRepository.findById(
      command.appointmentId,
    );

    appointment.cancel();
    await this.appointmentRepository.delete(appointment.id);
    this.eventBus.publish(new AppointmentCancelledEvent(appointment));
  }
}
