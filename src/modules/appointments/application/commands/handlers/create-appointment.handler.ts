import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
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
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { IUserRepository } from 'src/modules/users/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from 'src/modules/users/domain/repositories/user.repository.interface';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from 'src/modules/availability/domain/repositories/availability.repository.interface';
import { CreateAppointmentDto } from 'src/modules/appointments/presentation/dtos/create-appointment.dto';
import { Availability } from 'src/modules/availability/infrastructure/entities/availability.entity';

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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly eventBus: EventBus,
    private readonly rabbitMQProxy: RabbitMQProxy,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    const { createAppointmentDto, patientId } = command;
    this.logger.log(
      `Creating appointment for patient ${patientId} with doctor ${createAppointmentDto.doctorId}`,
    );

    // Verify doctor exists
    const doctor: Doctor = await this.doctorRepository.findById(
      createAppointmentDto.doctorId,
    );
    this.logger.debug(`Doctor ${createAppointmentDto.doctorId} verified`);

    //Get Patient
    const patient: User = await this.userRepository.findById(patientId);
    this.logger.debug(`Patient ${patientId} verified`);

    // Verify doctor is available
    const availability: Availability =
      await this.availabilityRepository.findById(
        createAppointmentDto.availabilityId,
      );

    // Check availability slot
    this.checkAvalabilityWithDoctorId(availability, doctor);
    this.checkValidStatusForAvailibility(availability);

    // Update availability status
    await this.availabilityRepository.update(availability.id, {
      isAvailable: false,
    });

    const appointment = new Appointment();
    Object.assign(appointment, {
      ...createAppointmentDto,
      patient,
      doctor,
      availability,
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
      appointmentTime: new Date(
        `${availability.date}T${availability.startTime}Z`,
      ),
    });
    this.logger.debug('Appointment booked message published to RabbitMQ');

    return createdAppointment;
  }

  private checkAvalabilityWithDoctorId(
    availability: Availability,
    doctor: Doctor,
  ) {
    if (availability.doctor?.id !== doctor.id) {
      this.logger.error(
        `Doctor ${doctor.id} does not matched with availability ${availability.id}`,
      );
      throw new NotFoundException('Not Found Availibility slot!!!');
    }
    this.logger.debug(
      `Doctor ${doctor.id} does matched with availability ${availability.id}`,
    );
  }

  private checkValidStatusForAvailibility(availability: Availability) {
    if (availability.isAvailable === false) {
      this.logger.error(`Availibility ${availability.id} is not available!`);
      throw new NotFoundException('Availibilty slot not found!');
    }
    this.logger.debug(`availibilty ${availability.id} is available!`);
  }
}
