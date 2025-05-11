import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateDoctorCommand } from '../impl/update-doctor.command';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY,
} from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../infrastructure/entities/doctor.entity';
import { DoctorUpdatedEvent } from '../../../domain/events/doctor-updated.event';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(UpdateDoctorCommand)
export class UpdateDoctorHandler
  implements ICommandHandler<UpdateDoctorCommand>
{
  private readonly logger = new Logger(UpdateDoctorHandler.name);

  constructor(
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateDoctorCommand): Promise<Doctor> {
    const { id, updateDoctorDto } = command;
    this.logger.log(`Updating doctor with ID: ${id}`);

    // Check if doctor exists
    await this.doctorRepository.findById(id);
    this.logger.debug(`Doctor ${id} found`);

    const updatedDoctor = await this.doctorRepository.update(
      id,
      updateDoctorDto,
    );
    this.logger.log(`Doctor ${id} updated successfully`);

    this.eventBus.publish(new DoctorUpdatedEvent(updatedDoctor));
    this.logger.debug('DoctorUpdatedEvent published');

    return updatedDoctor;
  }
}
