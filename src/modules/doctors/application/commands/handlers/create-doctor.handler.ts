import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateDoctorCommand } from '../impl/create-doctor.command';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY,
} from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../infrastructure/entities/doctor.entity';
import { DoctorCreatedEvent } from '../../../domain/events/doctor-created.event';

@CommandHandler(CreateDoctorCommand)
export class CreateDoctorHandler
  implements ICommandHandler<CreateDoctorCommand>
{
  private readonly logger = new Logger(CreateDoctorHandler.name);

  constructor(
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateDoctorCommand): Promise<Doctor> {
    const { createDoctorDto } = command;
    this.logger.log(`Creating new doctor with name: ${createDoctorDto.name}`);

    const doctor = new Doctor();
    Object.assign(doctor, createDoctorDto);

    const createdDoctor = await this.doctorRepository.create(doctor);
    this.logger.log(`Doctor created successfully with ID: ${createdDoctor.id}`);

    this.eventBus.publish(new DoctorCreatedEvent(createdDoctor));
    this.logger.debug('DoctorCreatedEvent published');

    return createdDoctor;
  }
}
