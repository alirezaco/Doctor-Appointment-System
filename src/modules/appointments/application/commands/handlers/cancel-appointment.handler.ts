import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CancelAppointmentCommand } from '../impl/cancel-appointment.command';
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from '../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../infrastructure/entities/appointment.entity';
import { AppointmentCancelledEvent } from '../../../domain/events/appointment-cancelled.event';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { AppointmentStatus } from 'src/modules/appointments/infrastructure/enums/appointment-status.enum';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from 'src/modules/availability/domain/repositories/availability.repository.interface';

@CommandHandler(CancelAppointmentCommand)
export class CancelAppointmentHandler
  implements ICommandHandler<CancelAppointmentCommand>
{
  private readonly logger: Logger = new Logger(CancelAppointmentCommand.name);

  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelAppointmentCommand): Promise<void> {
    const appointment = await this.appointmentRepository.findById(
      command.appointmentId,
    );

    this.canCancelAppointment(appointment, command.userId);
    this.checkValidStatus(appointment.status, [AppointmentStatus.CANCELLED]);

    // Update availability status
    await this.availabilityRepository.update(appointment.availability?.id, {
      isAvailable: true,
    });

    appointment.cancel();
    this.eventBus.publish(new AppointmentCancelledEvent(appointment));
    await this.appointmentRepository.update(appointment.id, appointment);
  }

  private canCancelAppointment(appointment: Appointment, userId: string): void {
    if (![appointment.patient.id, appointment.doctor.id].includes(userId)) {
      this.logger.error(
        `Try to cancel appointment ${appointment.id} without permisions`,
      );
      throw new ForbiddenException(
        'You are not allowed to cancel this appointment',
      );
    }
    this.logger.debug(
      `Try to cancel appointment ${appointment.id} with permisions`,
    );
  }

  private checkValidStatus(
    status: AppointmentStatus,
    invalidStatuses: AppointmentStatus[],
  ): void {
    if (invalidStatuses.includes(status)) {
      this.logger.error('Invalid appointment status');
      throw new BadRequestException('Invalid appointment status');
    }
    this.logger.debug('Appointment status is valid!');
  }
}
