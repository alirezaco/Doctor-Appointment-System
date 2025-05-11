import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateAppointmentCommand } from '../impl/create-appointment.command';
import {
  IAppointmentRepository,
  APPOINTMENT_REPOSITORY,
} from '../../../domain/repositories/appointment.repository.interface';
import {
  DOCTOR_REPOSITORY,
  IDoctorRepository,
} from '../../../../doctors/domain/repositories/doctor.repository.interface';
import { Appointment } from '../../../infrastructure/entities/appointment.entity';
import { AppointmentCreatedEvent } from '../../../domain/events/appointment-created.event';
import { RabbitMQProxy } from 'src/shared/proxy/rabbitmq.proxy';

@CommandHandler(CreateAppointmentCommand)
export class CreateAppointmentHandler
  implements ICommandHandler<CreateAppointmentCommand>
{
  private readonly logger = new Logger(CreateAppointmentHandler.name);

  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
    private readonly eventBus: EventBus,
    private readonly rabbitMQProxy: RabbitMQProxy,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    const { createAppointmentDto, patientId } = command;
    this.logger.log(
      `Creating appointment for patient ${patientId} with doctor ${createAppointmentDto.doctorId}`,
    );

    // Verify doctor exists
    await this.doctorRepository.findById(createAppointmentDto.doctorId);
    this.logger.debug(`Doctor ${createAppointmentDto.doctorId} verified`);

    // Check for overlapping appointments
    await this.appointmentRepository.findOverlapping(
      createAppointmentDto.doctorId,
      createAppointmentDto.startTime,
      createAppointmentDto.endTime,
    );
    this.logger.debug('No overlapping appointments found');

    const appointment = new Appointment();
    Object.assign(appointment, {
      ...createAppointmentDto,
      patient: { id: patientId },
      doctor: { id: createAppointmentDto.doctorId },
    });

    const createdAppointment =
      await this.appointmentRepository.create(appointment);
    this.logger.log(
      `Appointment ${createdAppointment.id} created successfully`,
    );

    this.eventBus.publish(new AppointmentCreatedEvent(createdAppointment));
    this.logger.debug('AppointmentCreatedEvent published');

    // Publish message to RabbitMQ
    await this.rabbitMQProxy.publishAppointmentBooked({
      appointmentId: createdAppointment.id,
      doctorId: createdAppointment.doctor.id,
      appointmentTime: createdAppointment.startTime,
    });
    this.logger.debug('Appointment booked message published to RabbitMQ');

    return createdAppointment;
  }
}
